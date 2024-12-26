// 评分常量
const SCORE = {
  MIN: 0,
  MAX: 100,
} as const;

/**
 * 评分区间配置
 */
export interface ScoreRange {
  /** 基础分数 */
  base: number;
  /** 惩罚因子 */
  factor: number;
}

/**
 * 评分等级
 */
export const SCORE_LEVELS = ["perfect", "good", "medium", "bad"] as const;
export type ScoreLevel = (typeof SCORE_LEVELS)[number];

/**
 * 评分阈值配置
 */
export type ThresholdConfig = Record<ScoreLevel, number>;

/**
 * 评分配置
 */
export type ScoreConfig = Record<ScoreLevel, ScoreRange>;

/**
 * 奖励配置
 */
export interface BonusConfig<T extends Record<string, number>> {
  /** 完美组合 */
  perfect: T & { score: number };
  /** 优秀组合 */
  excellent: T & { score: number };
  /** 良好组合 */
  good: T & { score: number };
}

/**
 * 惩罚配置
 */
export interface PenaltyConfig<T extends Record<string, number>> {
  /** 单项惩罚 */
  bad: {
    [K in keyof T]: {
      threshold: number;
      score: number;
    };
  };
  /** 组合惩罚 */
  combined: {
    score: number;
  };
}

/**
 * 惩罚计算配置
 */
export interface PenaltyCalcConfig {
  /** 惩罚平滑因子 (0-1) */
  smoothFactor?: number;
  /** 单项惩罚缩放因子 (0-1) */
  scaleFactor?: number;
  /** 组合惩罚使用平方根 */
  useSquareRoot?: boolean;
}

/**
 * 分段幂次配置
 */
export interface PowerConfig {
  perfect?: number; // 完美区间幂次
  good?: number; // 良好区间幂次
  medium?: number; // 中等区间幂次
  bad?: number; // 较差区间幂次
}

/**
 * 指标方向类型
 */
export type MetricDirection = "asc" | "desc"; // asc: 越大越好, desc: 越小越好

/**
 * 计算单个指标的得分
 * @param value 指标值
 * @param thresholds 阈值配置
 * @param scores 分数配置
 * @param power 幂次配置或默认幂次
 * @param direction 指标方向
 * @param smoothDecay 是否使用平滑衰减（针对超出范围的情况）
 */
export function calculateMetricScore(
  value: number,
  thresholds: ThresholdConfig,
  scores: ScoreConfig,
  power: number | PowerConfig = 2,
  direction: MetricDirection = "desc",
  smoothDecay = false,
) {
  // 根据方向选择比较函数
  const compareValue = (value: number, threshold: number): boolean => {
    return direction === "asc"
      ? value >= threshold // 越大越好
      : value <= threshold; // 越小越好
  };

  // 获取对应区间的幂次
  const getPower = (level: ScoreLevel): number => {
    if (typeof power === "number") return power;
    return power[level] ?? 2; // 默认使用2次幂
  };

  // 计算比率（考虑方向）
  const calculateRatio = (
    value: number,
    current: number,
    next: number,
  ): number => {
    if (direction === "asc") {
      // 越大越好：计算超出当前阈值的比例
      return (value - current) / (next - current);
    } else {
      // 越小越好：计算低于当前阈值的比例
      return (next - value) / (next - current);
    }
  };

  // 根据方向判断是否达到完美
  if (compareValue(value, thresholds.perfect)) {
    const ratio =
      direction === "asc"
        ? (value - thresholds.perfect) / (1 - thresholds.perfect) // 越大越好
        : value / thresholds.perfect; // 越小越好

    return (
      scores.perfect.base -
      scores.perfect.factor * Math.pow(ratio, getPower("perfect"))
    );
  }

  // 根据方向判断是否达到良好
  if (compareValue(value, thresholds.good)) {
    const ratio = calculateRatio(value, thresholds.perfect, thresholds.good);
    return (
      scores.good.base - scores.good.factor * Math.pow(ratio, getPower("good"))
    );
  }

  // 根据方向判断是否达到中等
  if (compareValue(value, thresholds.medium)) {
    const ratio = calculateRatio(value, thresholds.good, thresholds.medium);
    return (
      scores.medium.base -
      scores.medium.factor * Math.pow(ratio, getPower("medium"))
    );
  }

  // 根据方向判断是否达到较差
  if (compareValue(value, thresholds.bad)) {
    const ratio = calculateRatio(value, thresholds.medium, thresholds.bad);
    return (
      scores.bad.base - scores.bad.factor * Math.pow(ratio, getPower("bad"))
    );
  }

  // 超出范围的情况
  if (smoothDecay) {
    const maxBadScore = scores.bad.base;
    const minBadScore = maxBadScore * 0.3;
    const maxBadValue = direction === "asc" ? 0 : 1.0;
    const normalizedExcess = Math.pow(
      direction === "asc"
        ? (thresholds.bad - value) / (thresholds.bad - maxBadValue)
        : (value - thresholds.bad) / (maxBadValue - thresholds.bad),
      0.8,
    );

    return Math.max(
      minBadScore,
      maxBadScore - (maxBadScore - minBadScore) * normalizedExcess,
    );
  }

  // 不使用平滑衰减时，使用指数衰减
  const excessValue =
    direction === "asc" ? thresholds.bad - value : value - thresholds.bad;
  return scores.bad.base * Math.exp(-scores.bad.factor * excessValue);
}

/**
 * 计算组合奖励分数
 * @param metrics 各指标的值
 * @param bonus 奖励配置
 */
export function calculateBonus<T extends Record<string, number>>(
  metrics: T,
  bonus: BonusConfig<T>,
): number {
  // 检查是否满足完美条件
  const isPerfect = Object.entries(metrics).every(([key, value]) => {
    const threshold = bonus.perfect[key];
    return threshold !== undefined && value <= threshold;
  });
  if (isPerfect) return bonus.perfect.score;

  // 检查是否满足优秀条件
  const isExcellent = Object.entries(metrics).every(([key, value]) => {
    const threshold = bonus.excellent[key];
    return threshold !== undefined && value <= threshold;
  });
  if (isExcellent) return bonus.excellent.score;

  // 检查是否满足良好条件
  const isGood = Object.entries(metrics).every(([key, value]) => {
    const threshold = bonus.good[key];
    return threshold !== undefined && value <= threshold;
  });
  if (isGood) return bonus.good.score;

  return 0;
}

/**
 * 计算组合惩罚分数
 * @param metrics 各指标的值
 * @param penalty 惩罚配置
 * @param calcConfig 计算配置
 */
export function calculatePenalty<T extends Record<string, number>>(
  metrics: T,
  penalty: PenaltyConfig<T>,
  calcConfig: PenaltyCalcConfig = {},
): number {
  const {
    smoothFactor = 0.8,
    scaleFactor = 0.8,
    useSquareRoot = true,
  } = calcConfig;

  let totalPenalty = 0;
  let exceedCount = 0;

  // 计算各指标的惩罚
  for (const [key, value] of Object.entries(metrics)) {
    const badConfig = penalty.bad[key];
    if (!badConfig) continue;

    const threshold = badConfig.threshold;
    const excess = Math.max(0, value - threshold);

    if (excess > 0) {
      exceedCount++;
      const maxExcess = 1.0 - threshold;

      // 使用可配置的平滑函数
      const normalizedPenalty = useSquareRoot
        ? Math.sqrt(excess / maxExcess)
        : Math.pow(excess / maxExcess, smoothFactor);

      totalPenalty += badConfig.score * normalizedPenalty * scaleFactor;
    }
  }

  // 如果所有指标都超出阈值，应用组合惩罚
  if (exceedCount === Object.keys(metrics).length) {
    const avgExcess =
      Object.entries(metrics).reduce((sum, [key, value]) => {
        const badConfig = penalty.bad[key];
        if (!badConfig) return sum;
        return sum + Math.max(0, value - badConfig.threshold);
      }, 0) / exceedCount;

    const combinedPenalty = useSquareRoot
      ? penalty.combined.score * Math.sqrt(avgExcess)
      : penalty.combined.score * Math.pow(avgExcess, smoothFactor);

    totalPenalty = Math.min(totalPenalty, combinedPenalty);
  }

  return totalPenalty;
}

/**
 * 计算加权总分
 * @param scores 各指标的分数
 * @param weights 权重配置
 */
export function calculateWeightedScore(
  scores: Record<string, number>,
  weights: Record<string, number>,
): number {
  // 计算总权重和加权分数
  let totalWeight = 0;
  let weightedSum = 0;

  // 遍历权重配置
  for (const [key, weight] of Object.entries(weights)) {
    const score = scores[key];
    if (score === undefined) continue;

    totalWeight += weight;
    weightedSum += weight * score;
  }

  // 避免除以零
  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}

/**
 * 确保分数在有效范围内
 */
export function normalizeScore(score: number): number {
  return Math.max(SCORE.MIN, Math.min(SCORE.MAX, score));
}
