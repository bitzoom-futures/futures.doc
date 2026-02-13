# 仓位管理

本指南介绍如何在 Bitzoom 监控并管理你的合约仓位。

## 理解仓位

仓位代表你在某个合约上的风险敞口。仓位方向包括：

| 方向 | 说明 | 何时盈利 |
|-----------|-------------|-------------|
| **Long** | 买入合约（做多） | 价格上涨 |
| **Short** | 卖出合约（做空） | 价格下跌 |

## 仓位模式

Bitzoom 支持两种仓位模式：

### 单向模式（默认）

- 每个交易对只有一个净仓位
- 系统按多空相抵后的净仓位管理
- 适合更简单的交易管理

### 双向持仓（Hedge Mode）

- 多仓和空仓分开记录
- 可同时持有同一交易对的多空仓位
- 更适合对冲策略

### 切换仓位模式

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/positionSide/dual" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dualSidePosition": true}'
```

:::warning
切换仓位模式前，你必须先平掉全部仓位。
:::

## 查询仓位

### 获取全部仓位

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/openpositions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

响应示例：
```json
{
  "code": 0,
  "data": [
    {
      "symbol": "BTCUSDT",
      "positionSide": "LONG",
      "positionAmt": "0.100",
      "entryPrice": "50000.00",
      "markPrice": "51000.00",
      "unrealizedProfit": "100.00",
      "liquidationPrice": "45000.00",
      "leverage": 10,
      "marginType": "cross"
    }
  ]
}
```

### 获取仓位风险

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/positionrisk?symbol=BTCUSDT" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 字段说明

| 字段 | 说明 |
|-------|-------------|
| `symbol` | 交易对（例如 BTCUSDT） |
| `positionSide` | LONG、SHORT 或 BOTH（单向模式） |
| `positionAmt` | 仓位数量（负数表示空仓） |
| `entryPrice` | 平均开仓价 |
| `markPrice` | 用于计算盈亏的标记价格 |
| `unrealizedProfit` | 以计价币表示的未实现盈亏 |
| `liquidationPrice` | 触发强平的价格 |
| `leverage` | 当前杠杆倍数 |
| `marginType` | CROSS 或 ISOLATED |

## 杠杆管理

### 设置杠杆

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/leverage" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "leverage": 20
  }'
```

### 杠杆上限

最大杠杆会随仓位价值变化：

| 仓位价值（USDT） | 最大杠杆 |
|-----------------------|--------------|
| 0 - 50,000 | 125x |
| 50,000 - 250,000 | 100x |
| 250,000 - 1,000,000 | 50x |
| 1,000,000 - 5,000,000 | 20x |
| 5,000,000+ | 10x |

## 保证金类型

### 切换保证金类型

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/margintype" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "marginType": "ISOLATED"
  }'
```

### 全仓 vs 逐仓

| 特性 | 全仓（Cross） | 逐仓（Isolated） |
|---------|--------------|-----------------|
| 保证金池 | 所有仓位共享 | 按仓位独立 |
| 强平影响 | 可能影响全账户仓位 | 仅影响该仓位 |
| 资金效率 | 更高 | 更低 |
| 风险管理复杂度 | 更高 | 更低 |

### 增减逐仓保证金

```bash
# 增加保证金
curl -X POST "http://119.8.50.236:8088/api/v1/positionMargin" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "amount": 100,
    "type": 1
  }'

# 减少保证金
curl -X POST "http://119.8.50.236:8088/api/v1/positionMargin" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "amount": 50,
    "type": 2
  }'
```

## 平仓

### 用市价单平仓

```bash
# 平多仓
curl -X POST "http://119.8.50.236:8088/api/v1/order" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "SELL",
    "type": "MARKET",
    "quantity": 0.100,
    "reduceOnly": true
  }'
```

### 用限价单平仓

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/order" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "SELL",
    "type": "LIMIT",
    "quantity": 0.100,
    "price": 52000.00,
    "timeInForce": "GTC",
    "reduceOnly": true
  }'
```

### 取消某交易对全部挂单

```bash
curl -X DELETE "http://119.8.50.236:8088/api/v1/allOpenOrders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT"}'
```

## 设置止损止盈

### 止损单

通过止损保护下行风险：

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/order" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "SELL",
    "type": "STOP_MARKET",
    "stopPrice": 48000.00,
    "closePosition": true
  }'
```

### 止盈单

在目标价格锁定利润：

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/order" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "SELL",
    "type": "TAKE_PROFIT_MARKET",
    "stopPrice": 55000.00,
    "closePosition": true
  }'
```

### 同时设置止损和止盈

```python
import requests

BASE_URL = "http://119.8.50.236:8088"
TOKEN = "your_jwt_token"
headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# 开多仓
entry_order = {
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "MARKET",
    "quantity": 0.1
}
requests.post(f"{BASE_URL}/api/v1/order", headers=headers, json=entry_order)

# 设置止损（假设开仓约 50000，止损设在 -2%）
stop_loss = {
    "symbol": "BTCUSDT",
    "side": "SELL",
    "type": "STOP_MARKET",
    "stopPrice": 49000.00,
    "quantity": 0.1,
    "reduceOnly": True
}
requests.post(f"{BASE_URL}/api/v1/order", headers=headers, json=stop_loss)

# 设置止盈（+4%）
take_profit = {
    "symbol": "BTCUSDT",
    "side": "SELL",
    "type": "TAKE_PROFIT_MARKET",
    "stopPrice": 52000.00,
    "quantity": 0.1,
    "reduceOnly": True
}
requests.post(f"{BASE_URL}/api/v1/order", headers=headers, json=take_profit)
```

## 监控仓位盈亏

### 计算未实现盈亏

```python
def calculate_pnl(entry_price, mark_price, quantity, side):
    if side == "LONG":
        pnl = (mark_price - entry_price) * quantity
    else:  # SHORT
        pnl = (entry_price - mark_price) * quantity
    return pnl

# 示例
entry_price = 50000
mark_price = 51000
quantity = 0.1
side = "LONG"

pnl = calculate_pnl(entry_price, mark_price, quantity, side)
print(f"Unrealized PnL: ${pnl}")  # $100
```

### 计算 ROE（净值回报率）

```python
def calculate_roe(pnl, margin, leverage):
    return (pnl / margin) * 100

# 示例
margin = 500  # 初始保证金
leverage = 10
roe = calculate_roe(100, margin, leverage)
print(f"ROE: {roe}%")  # 20%
```

## 强平

### 理解强平价格

当你的保证金率低于维持保证金要求时会触发强平。

```python
def estimate_liquidation_price(entry_price, leverage, side, maint_margin_rate=0.004):
    if side == "LONG":
        liq_price = entry_price * (1 - (1/leverage) + maint_margin_rate)
    else:  # SHORT
        liq_price = entry_price * (1 + (1/leverage) - maint_margin_rate)
    return liq_price

# 示例：50000 开多，10x 杠杆
liq = estimate_liquidation_price(50000, 10, "LONG")
print(f"Estimated liquidation: ${liq:.2f}")  # ~$45200
```

### 避免强平

1. **降低杠杆** - 杠杆越高，强平价越近
2. **设置止损** - 在强平前主动退出
3. **持续监控仓位** - 定期检查保证金率
4. **追加保证金** - 逐仓模式下可主动补充保证金
5. **部分减仓** - 在高波动中缩小风险敞口

## 仓位历史

### 查询历史仓位

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/historyposition?symbol=BTCUSDT&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 查询成交历史

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/userTrades?symbol=BTCUSDT&limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 最佳实践

1. **平仓优先使用 reduceOnly** - 防止误开反向仓位
2. **开仓后尽快设止损** - 保护本金
3. **关注资金费率** - 永续合约持仓成本关键因素
4. **控制仓位规模** - 不要承担超出承受能力的风险
5. **高风险策略优先逐仓** - 限制潜在损失范围

## 下一步

- [下第一笔订单](./place-order.md) - 先掌握交易基础
- [API 参考](/docs/category/bitzoom-api) - 全量接口文档
- [错误码](../errors.md) - 定位与排查问题
