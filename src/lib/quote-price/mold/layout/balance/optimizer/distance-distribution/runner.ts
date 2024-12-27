import { findBestConfig } from "./optimizer";
import { ScoreReporter } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import { OptimizationProgressBar } from "../utils/progress-bar";
import type { DistributionInput, DistributionConfig } from "./core/types";
import type {
  FlatParams,
  ConfigScores,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

interface OptimizationResult {
  params: FlatParams;
  config: DistributionConfig;
  scores: ConfigScores<DistributionInput>;
  previousScores: ConfigScores<DistributionInput>;
}

/**
 * 测试距离分布优化器性能
 */
async function runDistributionOptimizer(
  iterations = 1,
): Promise<OptimizationResult> {
  const reporter = new ScoreReporter();

  return OptimizationProgressBar.runWithProgress<
    DistributionInput,
    DistributionConfig,
    FlatParams
  >({
    taskName: "距离分布",
    iterations,
    optimizeFunc: findBestConfig,
    onComplete: (result) => {
      reporter.generateReport({
        previousScores: result.previousScores,
        bestScores: result.scores,
        bestParams: result.params,
      });
    },
  });
}

export { runDistributionOptimizer };