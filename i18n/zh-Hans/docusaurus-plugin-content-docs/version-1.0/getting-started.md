# 快速开始

欢迎使用 Bitzoom 合约 API。本指南将帮助你完成第一条 API 调用。

## 概览

Bitzoom 合约 API 支持以下能力：
- **行情数据**：实时价格、订单簿、K 线
- **交易下单**：下单、撤单、查询
- **账户信息**：余额、仓位、历史记录
- **钱包能力**：充值与提现

## 基础地址

```
http://119.8.50.236:8088
```

## 快速上手

### 第一步：获取 API 凭证

1. 登录 Bitzoom 账户
2. 进入 **API Management**
3. 创建新的 API Key
4. 安全保存 API Key 与 Secret

:::warning
不要泄露 API Secret。请安全存储，并避免提交到版本控制系统。
:::

### 第二步：发起第一条请求

先调用无需鉴权的公开接口：

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

### 第三步：查询行情数据

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/exchangeinfo"
```

### 第四步：鉴权并获取余额

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/balance"   -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

JWT 获取方式见 [鉴权](./authentication.md)。

## 下一步

- [鉴权](./authentication.md)
- [WebSocket 实时流](./websocket.md)
- [下第一笔订单](./guides/place-order.md)
- [仓位管理](./guides/positions.md)
- [API 参考](/docs/category/bitzoom-api)
- [错误码](./errors.md)
- [常见问题](./faq.md)
