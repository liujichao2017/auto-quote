# 产品成本和模具费用计算指南

> 本指南详细说明了多产品组合模具的优化策略，包括产品分组方案、穴数布局优化、风险评估，以及模具成本和产品成本的精确计算方法，旨在为客户提供最优性价比的解决方案。

当我们为客户生产产品时，总价由两大部分组成：

1. 模具费用：制作模具本身的费用
2. 产品费用：使用该模具批量生产客户所需产品的费用

我们需要根据客户要求的产品数量 (Q) 来选择合适的"穴数" (c)，从而达到总费用的最优（最低）状态。

---

## 一、模具费用的计算

### 1. 模具材料成本 {#mold-cost}
模具体积(V)取决于模具的宽度、高度和深度（即模具尺寸会随着穴数和产品类型/组合而变化）。
模具材料的密度和单位价格为固定常数。

公式：\
模具材料成本 = 模具体积 × 模具材料密度 × 模具材料单价

## 2. 供应商运维费
这部分费用目前根据模具材料成本来计算，定于一个阈值，按照一个固定比例来计算，高于阈值，则按另一个比例计算

## 3. 毛利
包含比如寄样等等一切杂费，和模具的重量正相关，是一个不连续递增的函数

### 2. 额外加工费 {#processing-cost}
在制作模具时的特殊加工成本，根据模具的材料不同发生变化，有一个明确的业务上的映射表和计算方法。

公式：\
模具售价 = (模具材料成本 + 供应商运维费 + 毛利 + 额外加工费)

---

## 二、产品费用的计算 {#product-cost}

### 1. 产品材料成本 {#material-cost}
每件产品有自己的净体积、材料密度和材料单价。\
单件产品成本 = 产品净体积 × 产品材料密度 × 产品材料单价\
总产品材料成本 = ∑(Q_i × 单件产品成本_i)\
(对多产品场景，将每种产品的成本求和)

### 2. 材料损耗 {#material-waste}
生产中有损耗，损耗系数为常数。\
总损耗费用 = 总产品材料成本 × 损耗系数

### 3. 加工费用 {#processing-fee}
模具大小和安全注胶量决定所需机器吨位。机器吨位越大，成本越高。\
若有多种产品同时出模，注胶总量为各产品单件体积 × 密度 × 各自穴数之和。
得到总注胶量之后，还需要除以一个安全系数，比如0.8，得到安全注胶量。

加工费用包括：
1. 基础加工费
   - 按模次计费
   - 费率由机器吨位决定
**注意**：当材料、颜色不一样时，打个比方，3个完全不兼容的产品，放在一个模具上，此时要生产，必须单独顺序生产，那三个产品的加工费， 取决于模具的总尺寸，和三个产品中注胶量最大的那款产品。

2. 小批量费用
   - 当单趟生产模次 < 阈值（默认1000模次）时收取
   - 费用和吨位相关，是一个不连续的正相关函数
   - 机器吨位越大，小批量费用越高

> **注意**：小批量费用按生产趟数收取。例如，如果一个方案需要更换两次颜色，产生三趟生产，且每趟都不足1000模次，则需要收取三次小批量费用。

### 4. 生产模次 {#production-shots}
生产模次的计算取决于产品分组方案（详见[产品分组优化](#1-%E4%BA%A7%E5%93%81%E5%88%86%E7%BB%84%E4%BC%98%E5%8C%96-product-grouping)章节）：

对单产品：模次 = 向上取整(Q / 穴数)

对多产品且颜色相同的情况：\
可以同时出模生产多种产品，模次由需求最高的产品决定（或根据实际策略计算）。

对多产品且颜色不同的情况：\
需要分阶段生产。例如，先生产A（暂时封住B的腔不注胶或不使用），当A达成数量后，再生产B（不使用A的腔）。\
这样总模次 = A所需模次 + B所需模次。

不同颜色会影响生产策略：
* 若颜色相同：可一次性同时生产A和B，减少总模次。
* 若颜色不同：需先生产完一种颜色的产品，再生产另一种。

### 5. 产品利润 {#product-profit}
在产品生产总成本（材料+损耗+加工）上加利润。\
产品总售价 = (总产品材料成本 + 总损耗费用 + 总加工成本) × (1 + 产品利润系数)

---

## 三、模具尺寸的计算 {#mold-dimensions}

### 1. 布局优化 {#layout-optimization}
对于给定的产品组合和穴数方案，需要进行型腔布局优化：
- 基于产品包络体积的二维投影（宽W和深D）进行布局计算
- 考虑产品间的最小间距要求
- 通过最小面积布局算法（Minimum Area Layout）获得最优布局方案
- 计算最小外接矩形面积（Minimum Bounding Rectangle）

### 2. 模具尺寸确定 {#size-determination}
- 在最优布局基础上，结合产品高度(H)计算基础体积
- 添加边缘安全裕度（考虑模具结构要求）
- 添加垂直方向的高度裕度
- 计算最终模具体积 = (最小布局宽度 + 边缘裕度) × (最小布局深度 + 边缘裕度) × (最大产品高度 + 高度裕度)

### 3. 布局合理性评分 {#layout-scoring}
对计算得到的布局方案进行综合评分，评估其合理性：

1. **几何平衡评分** {#geometric-balance}
   - 评估产品在三维空间中的几何分布
   - 考虑产品的形状、尺寸和相对位置关系
   - 确保产品布局在几何上的合理性

2. **分布平衡评分** {#distribution-balance}
   - 评估产品在模具中的空间分布
   - 考虑重心分布和力的平衡
   - 确保模具开合时的稳定性

3. **流动平衡评分** {#flow-balance}
   - 评估材料在模具中的流动路径
   - 考虑浇口位置和流道设计
   - 确保材料填充的均匀性

综合评分计算：
- 总分 = w1×几何平衡分 + w2×分布平衡分 + w3×流动平衡分
- 设定最低分阈值
- 低于阈值的布局方案将被视为不可行方案

> **注意**：布局评分算法已实现，可直接通过三维几何坐标布局获得综合评分。

这些计算将直接影响模具的材料成本和所需的机器吨位。

---

## 四、风险评估 {#risk-assessment}

### 1. 基础风险因素 {#basic-risk}
1. **材料差异风险**
   - 不同材料的收缩率和加工温度差异
   - 影响模具寿命和产品精度

2. **颜色转换风险**
   - 清洗不充分导致的污染风险
   - 影响产品质量

3. **数量比例风险**
   - 生产不平衡导致的模具磨损
   - 影响模具寿命

### 2. 结构风险因素 {#structural-risk}
此条为未来备选，目前暂不考虑
1. **单边承压风险**
   - 部分型腔未使用时的不均匀受力
   - 影响模具结构强度

2. **温度分布风险**
   - 不同材料的加工温度差异
   - 影响产品质量

3. **流道平衡风险**
   - 材料流动不均匀
   - 影响产品质量

### 3. 风险评分 {#risk-scoring}

风险分计算：
```
风险分 = 基础分 +
        w1 × 材料差异风险 +
        w2 × 颜色转换风险 +
        w3 × 数量比例风险 +
        w4 × 结构风险
```

风险等级划分：
- 低风险（0-30分）：正常生产
- 中等风险（31-60分）：需要加强监控
- 高风险（61-80分）：建议更换方案
- 极高风险（>80分）：强烈建议更换方案

> **注意**：风险分会影响最终的方案评分和成本计算。

---

## 五、总费用 {#total-cost}

### 1. 基础费用
模具和产品的基础费用：\
基础总费用 = 模具售价 + 产品总售价

### 2. 风险调整
根据[风险评估](#risk-assessment)的结果，对基础费用进行调整：
- 低风险（0-30分）：无需调整
- 中等风险（31-60分）：基础费用 × (1 + 0.1)
- 高风险（61-80分）：基础费用 × (1 + 0.2)
- 极高风险（>80分）：基础费用 × (1 + 0.3)

### 3. 最终总费用
最终总费用 = 基础总费用 × (1 + 风险调整系数)

---

## 六、产品分组与穴数优化 {#grouping-and-optimization}

优化过程分为两个层次：产品分组优化和穴数优化。

### 1. 产品分组优化 {#product-grouping}

对于给定的n个产品，需要考虑所有可能的分组方式。每个分组方式代表一种将产品分配到不同模具的方案。

#### 1.1 分组方案生成 {#grouping-generation}
例如，对于3个产品A、B、C，所有可能的分组方式为：
1. 单模具方案：[A+B+C]
2. 双模具方案：
   - [A, B+C]
   - [B, A+C]
   - [C, A+B]
3. 三模具方案：[A, B, C]

> **注意**：这是一个集合划分问题，n个产品的可能分组数等于贝尔数B(n)。
> 例如：B(1)=1, B(2)=2, B(3)=5, B(4)=15, B(5)=52

#### 1.2 分组初步筛选 {#grouping-filtering}

默认情况下，以下组合会被自动筛除：
1. 材料不兼容组合
   - 不同材料的产品默认不放入同一模具
   - 材料转换可能导致残留和污染

2. 颜色冲突组合
   - 不同颜色的产品默认不放入同一模具
   - 颜色转换会增加清洗成本和材料浪费

#### 1.3 强制组合选项 {#forced-grouping}

可以通过启用"强制组合"选项来覆盖默认筛选规则：
- 允许不同材料组合
- 允许不同颜色组合

> **警告**：启用强制组合会增加生产风险，影响模具寿命。

#### 1.4 风险评估应用

在产品分组优化中，我们将使用[风险评估](#risk-assessment)的结果来：
1. 筛选可行的分组方案
2. 调整分组方案的成本估算
3. 确定最终的生产策略

### 2. 穴数优化 {#cavity-optimization}

1. 穴数取值范围
   - 每种产品的穴数都有其合理范围，由以下因素决定：
     * 产品尺寸：影响单穴占用空间
     * 模具最大尺寸：限制总空间
     * 机器吨位：限制最大注射量

2. 优化策略
   - 对每个可能的穴数组合 (c_1, c_2, ..., c_n)：
     * 计算模具成本：通过布局算法得到最小模具体积
     * 计算产品成本：考虑材料、损耗、加工费用等
     * 计算总成本
   - 从所有可行方案中选择总成本最低的方案

3. 搜索方法
   - 当可能的组合数较少时（如 ≤ 1000）：
     * 直接枚举所有穴数组合
     * 并行计算以提高效率
   - 当组合数过多时：
     * 使用启发式搜索
     * 应用比例约束（如c_i / c_j应在合理范围内）
     * 优先搜索经验值附近的解

### 3. 方案评估与选择 {#solution-evaluation}

评估标准包括：
1. 总成本（主要指标，已包含风险调整）
   - 模具总成本
   - 产品总成本
2. 实际可行性
   - 布局评分（详见[布局合理性评分](#3-%E5%B8%83%E5%B1%80%E5%90%88%E7%90%86%E6%80%A7%E8%AF%84%E5%88%86-layout-scoring)）
   - 生产风险评分（详见[风险评估](#14-%E9%A3%8E%E9%99%A9%E8%AF%84%E4%BC%B0-risk-assessment)）

最终选择综合评分最优的方案。

---

## 计划中的代码结构 {#code-structure}

```
src/
└── lib/
    └── quote-price/                  # 报价系统根目录
        ├── index.ts                  # 模块入口文件，导出所有顶层模块
        ├── materials/                # 材料管理（顶层模块）
        │   ├── index.ts              # 导出所有材料相关函数和类型
        │   ├── mold-materials.ts     # 模具材料属性定义、成本计算和材料选择
        │   ├── product-materials.ts  # 产品材料属性定义、成本计算和兼容性检查
        │   └── types.ts              # 材料相关类型：密度、价格、收缩率等
        ├── machine/                  # 机器相关（顶层模块）
        │   ├── index.ts              # 导出所有机器相关函数和类型
        │   ├── types.ts              # 机器相关类型：吨位、费率等
        │   ├── tonnage.ts            # 根据注胶量和材料属性计算所需机器吨位
        │   ├── operation-cost.ts     # 计算基础加工费用，考虑吨位和模次
        │   └── small-batch.ts        # 计算小批量加工费用，基于吨位的阶梯式费率
        ├── mold/                     # 模具相关（顶层模块）
        │   ├── index.ts              # 导出所有模具相关函数和类型
        │   ├── types.ts              # 模具相关类型：尺寸、布局等
        │   ├── cost.ts               # 计算模具总成本：材料、加工、运维和毛利
        │   ├── layout/               # 模具布局相关逻辑
        │   │   ├── index.ts          # 导出所有布局相关函数
        │   │   ├── min-area.ts       # 实现最小面积布局算法，优化型腔排布
        │   │   ├── cavity-spacing.ts # 计算型腔间距，确保结构强度
        │   │   ├── safety-margin.ts  # 计算边缘和高度安全裕度
        │   │   └── balance/          # 布局平衡评分
        │   │       ├── index.ts      # 导出所有平衡评分函数
        │   │       ├── geometric.ts  # 评估三维空间中的几何分布
        │   │       ├── distribution.ts # 评估重心分布和力的平衡
        │   │       └── flow.ts       # 评估材料流动路径的均匀性
        │   └── dimensions.ts         # 计算最终模具尺寸，包含所有裕度
        ├── product/                  # 产品相关（顶层模块）
        │   ├── index.ts              # 导出所有产品相关函数和类型
        │   ├── types.ts              # 产品相关类型：尺寸、材料、颜色等
        │   ├── cost.ts               # 计算产品成本：材料、损耗和加工
        │   ├── volume.ts             # 计算净体积（成本）和包络体积（布局）
        │   ├── waste.ts              # 计算材料损耗费用
        │   └── production-strategy.ts # 确定生产策略，计算模次
        ├── risk/                     # 风险评估（顶层模块）
        │   ├── index.ts              # 导出所有风险评估函数和类型
        │   ├── types.ts              # 风险相关类型：等级、配置等
        │   ├── basic.ts              # 计算基础风险：材料、颜色、数量
        │   └── structural.ts         # 计算结构风险：承压、温度、流道
        └── optimization/             # 优化相关（顶层模块）
            ├── index.ts              # 导出所有优化相关函数和类型
            ├── types.ts              # 优化相关类型：配置、约束等
            ├── grouping/             # 产品分组优化
            │   ├── index.ts          # 导出所有分组相关函数
            │   ├── generator.ts      # 生成所有可能的分组方案
            │   ├── compatibility.ts  # 检查产品组合的材料和颜色兼容性
            │   └── evaluator.ts      # 评估分组方案的可行性和成本
            └── cavity-search/        # 穴数优化
                ├── index.ts          # 导出所有穴数优化函数
                ├── constraints.ts    # 定义穴数约束：尺寸、吨位等
                ├── cost-function.ts  # 计算不同穴数方案的总成本
                └── search-strategy.ts # 实现穴数组合的搜索策略
```