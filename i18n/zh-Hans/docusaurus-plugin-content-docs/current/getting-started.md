# 快速开始

欢迎使用 Bitzoom 合约 API。本指南将帮助你完成第一条 API 调用。

## 概览

Bitzoom 合约 API 提供以下程序化能力：
- **行情数据** - 实时价格、订单簿与 K 线
- **交易** - 下单、改单与撤单
- **账户** - 查询余额、仓位与成交历史
- **钱包** - 充值与提现

## 基础地址

```
http://119.8.50.236:8088
```

## 快速上手

### 第一步：获取 API 凭证

1. 登录你的 Bitzoom 账户
2. 进入 **API Management**
3. 创建新的 API Key
4. 安全保存 API Key 与 Secret

:::warning
不要泄露你的 API Secret。请安全存储，且绝不要提交到版本控制。
:::

### 第二步：发起第一条请求

先用一个无需鉴权的公开接口测试连接：

```bash
curl -X GET "http://119.8.50.236:8088/api/gateway/ping"
```

预期返回：
```json
{
  "code": 0,
  "msg": "success"
}
```

### 第三步：获取行情数据

拉取可交易的交易对：

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/exchangeinfo"
```

### 第四步：鉴权并查询余额

拿到 API 凭证后即可访问私有接口：

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/balance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

JWT 获取方式请参考 [鉴权](./authentication.md)。

## 下一步

- [鉴权](./authentication.md) - 学习 API 请求鉴权流程
- [WebSocket 实时流](./websocket.md) - 获取实时市场数据
- [下第一笔订单](./guides/place-order.md) - 交易教程
- [仓位管理](./guides/positions.md) - 管理仓位风险
- [API 参考](/docs/category/bitzoom-api) - 浏览全部可用接口
- [错误码](./errors.md) - 完整错误码说明
- [常见问题](./faq.md) - 高频问题解答

## 速率限制

| 接口类型 | 速率限制 |
|--------------|------------|
| 公开接口 | 10 请求/秒 |
| 私有接口 | 5 请求/秒 |
| 下单接口 | 10 单/秒 |

:::tip
实时数据建议优先使用 WebSocket，减少 REST 轮询调用。
:::

## 错误处理

所有 API 响应遵循统一结构：

```json
{
  "code": 0,
  "msg": "success",
  "data": { }
}
```

| Code | 说明 |
|------|-------------|
| 0 | 成功 |
| -1 | 未知错误 |
| -1001 | 连接中断 |
| -1002 | 未授权 |
| -1003 | 超出速率限制 |
| -1021 | 时间戳超出 recv window |
| -1022 | 签名无效 |

## 支持

如果你遇到问题：
- 先查看 [常见问题](./faq.md)
- 参考 [错误码](./errors.md) 做排查
- 加入我们的 [Discord](https://discord.gg/bitzoom)
- 邮箱：api-support@bitzoom.com
