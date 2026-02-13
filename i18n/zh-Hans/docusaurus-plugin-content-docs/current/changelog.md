# 更新日志

Bitzoom 合约 API 的所有重要变更都会记录在这里。

## 版本策略

API 使用语义化版本（Semantic Versioning），变更分类如下：
- **Added** - 新增功能或接口
- **Changed** - 现有行为变化
- **Deprecated** - 已废弃，未来将移除
- **Removed** - 当前版本中已移除
- **Fixed** - 缺陷修复
- **Security** - 安全相关更新

---

## [Unreleased]

### Planned
- WebSocket 订单簿 diff 流
- 批量下单接口
- 历史资金费率接口

---

## [1.0.0] - 2024-01-15

### Added
- 首个公开 API 正式版本
- 新增 REST API：
  - 行情数据（ticker、depth、klines、trades）
  - 账户管理（balance、positions）
  - 订单管理（place、cancel、query）
  - 钱包能力（deposit、withdraw）
- 新增 WebSocket 实时流
- 支持 JWT Bearer 鉴权
- 上线 API 速率限制体系

### Endpoints
| 分类 | 接口 |
|----------|-----------|
| Gateway | `/api/gateway/ping`, `/api/gateway/time` |
| Market Data | `/api/v1/ticker/*`, `/api/v1/depth`, `/api/v1/klines` |
| Trading | `/api/v1/order`, `/api/v1/openorders`, `/api/v1/historyorder` |
| Account | `/api/v1/balance`, `/api/v1/leverage`, `/api/v1/margintype` |
| Position | `/api/v1/openpositions`, `/api/v1/positionrisk` |
| Wallet | `/api/v1/wallet/*` |

---

## 迁移指南

### 从 Beta 迁移到 v1.0.0

如果你此前使用的是 Beta 版本 API，请注意以下变化：

1. **基础地址变更**
   ```
   # Old (Beta)
   http://119.8.50.236:8088

   # New (v1.0.0)
   http://119.8.50.236:8088
   ```

2. **鉴权请求头**
   ```
   # Old
   X-API-KEY: your_api_key

   # New
   Authorization: Bearer your_jwt_token
   ```

3. **响应结构**
   ```json
   // Old
   { "success": true, "result": { } }

   // New
   { "code": 0, "msg": "success", "data": { } }
   ```

4. **订单方向字段取值**
   ```
   # Old
   side: "buy" / "sell"

   # New
   side: "BUY" / "SELL"
   ```

---

## 废弃策略

当接口能力进入废弃期时：

1. **提前公告** - 移除前至少提前 90 天通知
2. **告警期** - 接口返回 deprecation warning 头
3. **迁移文档** - 提供替代方案与迁移步骤
4. **正式移除** - 通知期结束后执行下线

### 当前已废弃项

*当前暂无废弃项。*

---

## 限流策略变更

| 日期 | 变更 |
|------|--------|
| 2024-01-15 | 初始限额：公开 10 req/s，私有 5 req/s |

---

## Breaking Change 通知

破坏性变更将通过以下渠道提前告知：
- 向已注册 API 用户发送邮件
- 发布在 [状态页](https://status.bitzoom.com)
- 更新本更新日志
- 至少提前 30 天通知

---

## 订阅更新

及时获取 API 变更：
- **Email**: 在 [bitzoom.com/api-updates](https://bitzoom.com/api-updates) 订阅
- **Discord**: 加入 [discord.gg/bitzoom](https://discord.gg/bitzoom) 的 `#api-announcements`
- **Twitter**: 关注 [@BitzoomAPI](https://twitter.com/BitzoomAPI)
- **GitHub**: 关注本仓库 release

---

## 支持

如果你对 API 变更有疑问：
- 邮箱：[api-support@bitzoom.com](mailto:api-support@bitzoom.com)
- Discord：[discord.gg/bitzoom](https://discord.gg/bitzoom)
