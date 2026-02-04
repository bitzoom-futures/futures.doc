# 仓位管理

本指南介绍如何查询与管理 Bitzoom 合约仓位。

## 仓位基础

| 方向 | 含义 | 盈利条件 |
|------|------|----------|
| **Long** | 做多 | 价格上涨 |
| **Short** | 做空 | 价格下跌 |

## 仓位模式

Bitzoom 支持两种模式：

### 单向持仓（默认）
- 同一交易对只有净仓位
- 管理更简单

### 双向持仓（对冲）
- 同时持有多仓与空仓
- 适合对冲策略

切换模式：

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/positionSide/dual"   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"dualSidePosition": true}'
```

:::warning
切换仓位模式前，请先平掉所有仓位。
:::

## 查询仓位

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/openpositions"   -H "Authorization: Bearer YOUR_TOKEN"
```

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/positionrisk?symbol=BTCUSDT"   -H "Authorization: Bearer YOUR_TOKEN"
```

## 杠杆与保证金

设置杠杆：

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/leverage"   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","leverage":20}'
```

切换保证金模式：

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/margintype"   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","marginType":"ISOLATED"}'
```

## 平仓

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/order"   -H "Authorization: Bearer YOUR_TOKEN"   -H "Content-Type: application/json"   -d '{"symbol":"BTCUSDT","side":"SELL","type":"MARKET","quantity":0.1,"reduceOnly":true}'
```
