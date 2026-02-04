# 更新日志

本页面记录 Bitzoom 合约 API 的重要变更。

## 版本说明

我们使用语义化版本（Semantic Versioning）：
- **Added**：新增能力
- **Changed**：行为变更
- **Deprecated**：计划废弃
- **Removed**：已移除
- **Fixed**：问题修复
- **Security**：安全更新

---

## [Unreleased]

### 计划中
- WebSocket 订单簿增量流
- 批量下单接口
- 历史资金费率接口

---

## [1.0.0] - 2024-01-15

### Added
- 首个公开版本发布
- REST API：行情、交易、账户、钱包
- WebSocket 实时数据流
- JWT Bearer 鉴权
- 统一限频机制

### 主要接口
| 分类 | 接口 |
|------|------|
| Gateway | `/api/gateway/ping`, `/api/gateway/time` |
| 行情 | `/api/v1/ticker/*`, `/api/v1/depth`, `/api/v1/klines` |
| 交易 | `/api/v1/order`, `/api/v1/openorders`, `/api/v1/historyorder` |
| 账户 | `/api/v1/balance`, `/api/v1/leverage`, `/api/v1/margintype` |
| 仓位 | `/api/v1/openpositions`, `/api/v1/positionrisk` |
| 钱包 | `/api/v1/wallet/*` |

---

## 破坏性变更通知

如有破坏性变更，我们会通过以下渠道提前通知：
- 注册邮箱
- 状态页
- 本页面更新日志
- 至少提前 30 天
