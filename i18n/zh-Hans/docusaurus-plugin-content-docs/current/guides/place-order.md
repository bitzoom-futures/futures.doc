# 下第一笔订单

本指南演示如何在 Bitzoom 合约完成首笔交易。

## 前置条件

- 已有 Bitzoom 账户且有可用资金
- 已获得 JWT Token（见 [鉴权](../authentication.md)）
- 了解基础合约交易概念

## 步骤 1：查询可交易品种

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/exchangeinfo"
```

## 步骤 2：确认余额

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/balance"   -H "Authorization: Bearer YOUR_TOKEN"
```

## 步骤 3：查看当前价格

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/ticker/price?symbol=BTCUSDT"
```

## 步骤 4：设置杠杆（可选）

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/leverage"   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","leverage":10}'
```

## 步骤 5：下单

### 市价单

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/order"   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":0.001}'
```

### 限价单

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/order"   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","side":"BUY","type":"LIMIT","quantity":0.001,"price":50000,"timeInForce":"GTC"}'
```

## 常用参数

| 参数 | 说明 |
|------|------|
| `symbol` | 交易对，例如 `BTCUSDT` |
| `side` | `BUY` 或 `SELL` |
| `type` | `MARKET` / `LIMIT` / `STOP` / `TAKE_PROFIT` |
| `quantity` | 下单数量 |
| `price` | 限价单价格 |
| `timeInForce` | `GTC` / `IOC` / `FOK` |

## 步骤 6：查询订单状态

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/order?symbol=BTCUSDT&orderId=123456789"   -H "Authorization: Bearer YOUR_TOKEN"
```

## 步骤 7：撤单

```bash
curl -X DELETE "http://119.8.50.236:8088/api/v1/order"   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","orderId":123456789}'
```
