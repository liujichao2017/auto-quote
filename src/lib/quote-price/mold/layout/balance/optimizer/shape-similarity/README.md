# 形状相似度优化器

本模块专注于评估和优化模具布局中各组件的形状相似度，通过分析维度差异和极端情况来优化布局的几何平衡性。

## 关键指标

1. 维度差异分析
   - 计算组件间的维度差异
   - 评估维度交换的影响
   - 考虑不同维度的权重

2. 极端情况处理
   - 识别显著的形状差异
   - 评估离群点情况
   - 应用合理的惩罚机制

## 实现指南

1. 核心配置（`core/config.ts`）
   - 定义维度差异指数
   - 设置维度权重参数
   - 配置极端情况阈值

2. 评分系统（`scoring/calculator.ts`）
   - 实现维度差异计算
   - 评估形状相似度
   - 计算综合几何得分

3. 优化策略（`optimizer.ts`）
   - 平衡维度差异
   - 处理极端情况
   - 考虑实际加工约束