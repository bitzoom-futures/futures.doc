# 下第一笔订单

本指南将带你在 Bitzoom 完成第一笔合约下单。

## 前置条件

- 已有 Bitzoom 账户并有可用资金
- 持有有效 JWT Token（见 [鉴权](../authentication.md)）
- 了解基础合约交易概念

## 第一步：查看可交易市场

先获取交易对列表：

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/exchangeinfo"
```

返回示例：
```json
{
  "code": 0,
  "data": {
    "symbols": [
      {
        "symbol": "BTCUSDT",
        "baseAsset": "BTC",
        "quoteAsset": "USDT",
        "pricePrecision": 2,
        "quantityPrecision": 3
      }
    ]
  }
}
```

## 第二步：检查账户余额

确认保证金充足：

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 第三步：获取当前价格

先看最新市场价格：

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/ticker/price?symbol=BTCUSDT"
```

## 第四步：设置杠杆（可选）

下单前可先调整杠杆：

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/leverage" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "leverage": 10
  }'
```

## 第五步：下单

### 市价单

按当下最优价格立即成交：

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/order" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "MARKET",
    "quantity": 0.001
  }'
```

### 限价单

在指定价格或更优价格成交：

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/order" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "quantity": 0.001,
    "price": 50000.00,
    "timeInForce": "GTC"
  }'
```

## 订单参数说明

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `symbol` | string | 是 | 交易对（如 `BTCUSDT`） |
| `side` | string | 是 | `BUY` 或 `SELL` |
| `type` | string | 是 | `MARKET`、`LIMIT`、`STOP`、`TAKE_PROFIT` |
| `quantity` | decimal | 是 | 以标的资产计的下单数量 |
| `price` | decimal | 仅限价单 | 订单价格 |
| `timeInForce` | string | 仅限价单 | `GTC`、`IOC`、`FOK` |
| `stopPrice` | decimal | 仅条件单 | 触发价格 |

## 下单响应示例

```json
{
  "code": 0,
  "data": {
    "orderId": 123456789,
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "price": "50000.00",
    "quantity": "0.001",
    "status": "NEW",
    "createTime": 1234567890000
  }
}
```

## 第六步：监控订单

### 查询订单状态

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/order?symbol=BTCUSDT&orderId=123456789" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 查询当前挂单

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/openorders?symbol=BTCUSDT" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 第七步：撤单

如果需要，可撤销未成交订单：

```bash
curl -X DELETE "http://119.8.50.236:8088/api/v1/order" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "orderId": 123456789
  }'
```

## 完整 Python 示例

```python
import requests

BASE_URL = "http://119.8.50.236:8088"
TOKEN = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# 1. 查询余额
balance = requests.get(f"{BASE_URL}/api/v1/balance", headers=headers)
print("Balance:", balance.json())

# 2. 获取当前价格
price = requests.get(f"{BASE_URL}/api/v1/ticker/price?symbol=BTCUSDT")
print("Current price:", price.json())

# 3. 提交限价单
order_data = {
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "quantity": 0.001,
    "price": 50000.00,
    "timeInForce": "GTC"
}

order = requests.post(
    f"{BASE_URL}/api/v1/order",
    headers=headers,
    json=order_data
)
print("Order placed:", order.json())

# 4. 查询订单状态
order_id = order.json()["data"]["orderId"]
status = requests.get(
    f"{BASE_URL}/api/v1/order?symbol=BTCUSDT&orderId={order_id}",
    headers=headers
)
print("Order status:", status.json())
```

## 订单类型说明

| 类型 | 说明 | 典型用途 |
|------|-------------|----------|
| **MARKET** | 立即按最优价成交 | 快速进出场 |
| **LIMIT** | 在指定价或更优价成交 | 对成交价敏感 |
| **STOP** | 达到触发价后触发市价单 | 止损 |
| **TAKE_PROFIT** | 达到目标价后触发限价/条件单 | 止盈 |

## 常见错误

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `-2010 Insufficient balance` | 保证金不足 | 追加资金 |
| `-2011 Order not found` | 订单 ID 无效 | 检查订单 ID |
| `-2015 Invalid side` | side 参数错误 | 使用 `BUY` 或 `SELL` |
| `-2018 Invalid quantity` | 数量超出限制 | 检查最小/最大下单量 |

## 下一步

- [API 参考](/docs/category/bitzoom-api) - 浏览全部接口
- [快速开始](../getting-started.md) - 回到总览
- [鉴权](../authentication.md) - 复查鉴权配置
