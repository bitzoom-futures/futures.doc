# Place Your First Order

This guide walks you through placing your first futures order on Bitzoom.

## Prerequisites

- Bitzoom account with funds
- Valid JWT token (see [Authentication](../authentication.md))
- Understanding of futures trading basics

## Step 1: Check Available Markets

First, get the list of available trading pairs:

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/exchangeinfo"
```

Response:
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

## Step 2: Check Your Balance

Verify you have sufficient margin:

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Step 3: Get Current Price

Check the current market price:

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/ticker/price?symbol=BTCUSDT"
```

## Step 4: Set Leverage (Optional)

Adjust your leverage before placing orders:

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/leverage" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "leverage": 10
  }'
```

## Step 5: Place an Order

### Market Order

Execute immediately at the best available price:

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

### Limit Order

Execute at a specific price or better:

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

## Order Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Trading pair (e.g., "BTCUSDT") |
| `side` | string | Yes | "BUY" or "SELL" |
| `type` | string | Yes | "MARKET", "LIMIT", "STOP", "TAKE_PROFIT" |
| `quantity` | decimal | Yes | Order amount in base asset |
| `price` | decimal | Limit only | Order price |
| `timeInForce` | string | Limit only | "GTC", "IOC", "FOK" |
| `stopPrice` | decimal | Stop only | Trigger price |

## Order Response

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

## Step 6: Monitor Your Order

### Check Order Status

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/order?symbol=BTCUSDT&orderId=123456789" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List Open Orders

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/openorders?symbol=BTCUSDT" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Step 7: Cancel an Order

If needed, cancel your pending order:

```bash
curl -X DELETE "http://119.8.50.236:8088/api/v1/order" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "orderId": 123456789
  }'
```

## Complete Python Example

```python
import requests

BASE_URL = "http://119.8.50.236:8088"
TOKEN = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# 1. Check balance
balance = requests.get(f"{BASE_URL}/api/v1/balance", headers=headers)
print("Balance:", balance.json())

# 2. Get current price
price = requests.get(f"{BASE_URL}/api/v1/ticker/price?symbol=BTCUSDT")
print("Current price:", price.json())

# 3. Place a limit order
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

# 4. Check order status
order_id = order.json()["data"]["orderId"]
status = requests.get(
    f"{BASE_URL}/api/v1/order?symbol=BTCUSDT&orderId={order_id}",
    headers=headers
)
print("Order status:", status.json())
```

## Order Types Explained

| Type | Description | Use Case |
|------|-------------|----------|
| **MARKET** | Execute immediately at best price | Quick entry/exit |
| **LIMIT** | Execute at specified price or better | Price-sensitive orders |
| **STOP** | Trigger market order at stop price | Stop-loss |
| **TAKE_PROFIT** | Trigger limit order at target | Profit taking |

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `-2010 Insufficient balance` | Not enough margin | Deposit more funds |
| `-2011 Order not found` | Invalid order ID | Check order ID |
| `-2015 Invalid side` | Wrong side value | Use "BUY" or "SELL" |
| `-2018 Invalid quantity` | Quantity too small/large | Check min/max limits |

## Next Steps

- [API Reference](/docs/category/bitzoom-api) - Explore all endpoints
- [Getting Started](../getting-started.md) - Back to overview
- [Authentication](../authentication.md) - Review authentication setup
