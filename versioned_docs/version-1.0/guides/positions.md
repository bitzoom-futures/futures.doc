# Position Management

This guide covers how to monitor and manage your futures positions on Bitzoom.

## Understanding Positions

A position represents your exposure to a futures contract. Positions can be:

| Direction | Description | Profit When |
|-----------|-------------|-------------|
| **Long** | You bought the contract | Price increases |
| **Short** | You sold the contract | Price decreases |

## Position Modes

Bitzoom supports two position modes:

### One-Way Mode (Default)

- Single position per symbol
- Net position (long minus short)
- Simpler to manage

### Hedge Mode

- Separate long and short positions
- Can hold both directions simultaneously
- More flexible for hedging strategies

### Change Position Mode

```bash
curl -X POST "https://api.bitzoom.com/api/v1/positionSide/dual" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dualSidePosition": true}'
```

:::warning
You must close all positions before changing position mode.
:::

## Checking Positions

### Get All Open Positions

```bash
curl -X GET "https://api.bitzoom.com/api/v1/openpositions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
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

### Get Position Risk

```bash
curl -X GET "https://api.bitzoom.com/api/v1/positionrisk?symbol=BTCUSDT" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Position Fields Explained

| Field | Description |
|-------|-------------|
| `symbol` | Trading pair (e.g., BTCUSDT) |
| `positionSide` | LONG, SHORT, or BOTH (one-way mode) |
| `positionAmt` | Position quantity (negative = short) |
| `entryPrice` | Average entry price |
| `markPrice` | Current mark price for PnL calculation |
| `unrealizedProfit` | Unrealized PnL in quote currency |
| `liquidationPrice` | Price at which position will be liquidated |
| `leverage` | Current leverage multiplier |
| `marginType` | CROSS or ISOLATED |

## Managing Leverage

### Set Leverage

```bash
curl -X POST "https://api.bitzoom.com/api/v1/leverage" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "leverage": 20
  }'
```

### Leverage Limits

Maximum leverage varies by position size:

| Position Value (USDT) | Max Leverage |
|-----------------------|--------------|
| 0 - 50,000 | 125x |
| 50,000 - 250,000 | 100x |
| 250,000 - 1,000,000 | 50x |
| 1,000,000 - 5,000,000 | 20x |
| 5,000,000+ | 10x |

## Margin Types

### Change Margin Type

```bash
curl -X POST "https://api.bitzoom.com/api/v1/margintype" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "marginType": "ISOLATED"
  }'
```

### Cross vs Isolated Margin

| Feature | Cross Margin | Isolated Margin |
|---------|--------------|-----------------|
| Margin pool | Shared across positions | Per position |
| Liquidation risk | All positions affected | Only that position |
| Capital efficiency | Higher | Lower |
| Risk management | More complex | Simpler |

### Add/Remove Isolated Margin

```bash
# Add margin to position
curl -X POST "https://api.bitzoom.com/api/v1/positionMargin" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "amount": 100,
    "type": 1
  }'

# Remove margin from position
curl -X POST "https://api.bitzoom.com/api/v1/positionMargin" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "amount": 50,
    "type": 2
  }'
```

## Closing Positions

### Close with Market Order

```bash
# Close a long position
curl -X POST "https://api.bitzoom.com/api/v1/order" \
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

### Close with Limit Order

```bash
curl -X POST "https://api.bitzoom.com/api/v1/order" \
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

### Close All Positions for Symbol

```bash
curl -X DELETE "https://api.bitzoom.com/api/v1/allOpenOrders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT"}'
```

## Setting Stop-Loss and Take-Profit

### Stop-Loss Order

Protect against losses by setting a stop-loss:

```bash
curl -X POST "https://api.bitzoom.com/api/v1/order" \
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

### Take-Profit Order

Lock in profits at a target price:

```bash
curl -X POST "https://api.bitzoom.com/api/v1/order" \
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

### Combined Stop-Loss and Take-Profit

```python
import requests

BASE_URL = "https://api.bitzoom.com"
TOKEN = "your_jwt_token"
headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Open long position
entry_order = {
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "MARKET",
    "quantity": 0.1
}
requests.post(f"{BASE_URL}/api/v1/order", headers=headers, json=entry_order)

# Set stop-loss (2% below entry)
stop_loss = {
    "symbol": "BTCUSDT",
    "side": "SELL",
    "type": "STOP_MARKET",
    "stopPrice": 49000.00,  # Assuming entry ~50000
    "quantity": 0.1,
    "reduceOnly": True
}
requests.post(f"{BASE_URL}/api/v1/order", headers=headers, json=stop_loss)

# Set take-profit (4% above entry)
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

## Monitoring Position PnL

### Calculate Unrealized PnL

```python
def calculate_pnl(entry_price, mark_price, quantity, side):
    if side == "LONG":
        pnl = (mark_price - entry_price) * quantity
    else:  # SHORT
        pnl = (entry_price - mark_price) * quantity
    return pnl

# Example
entry_price = 50000
mark_price = 51000
quantity = 0.1
side = "LONG"

pnl = calculate_pnl(entry_price, mark_price, quantity, side)
print(f"Unrealized PnL: ${pnl}")  # $100
```

### Calculate ROE (Return on Equity)

```python
def calculate_roe(pnl, margin, leverage):
    return (pnl / margin) * 100

# Example
margin = 500  # Initial margin
leverage = 10
roe = calculate_roe(100, margin, leverage)
print(f"ROE: {roe}%")  # 20%
```

## Liquidation

### Understanding Liquidation Price

Liquidation occurs when your margin ratio falls below the maintenance margin requirement.

```python
def estimate_liquidation_price(entry_price, leverage, side, maint_margin_rate=0.004):
    if side == "LONG":
        liq_price = entry_price * (1 - (1/leverage) + maint_margin_rate)
    else:  # SHORT
        liq_price = entry_price * (1 + (1/leverage) - maint_margin_rate)
    return liq_price

# Example: Long at $50000 with 10x leverage
liq = estimate_liquidation_price(50000, 10, "LONG")
print(f"Estimated liquidation: ${liq:.2f}")  # ~$45200
```

### Avoiding Liquidation

1. **Use lower leverage** - Higher leverage = closer liquidation price
2. **Set stop-losses** - Exit before liquidation
3. **Monitor positions** - Check margin ratio regularly
4. **Add margin** - Increase margin in isolated positions
5. **Partial close** - Reduce position size in volatile markets

## Position History

### Get Closed Positions

```bash
curl -X GET "https://api.bitzoom.com/api/v1/historyposition?symbol=BTCUSDT&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Trade History

```bash
curl -X GET "https://api.bitzoom.com/api/v1/userTrades?symbol=BTCUSDT&limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Best Practices

1. **Always use reduceOnly for closing** - Prevents accidentally opening opposite position
2. **Set stop-loss immediately** - Protect capital from unexpected moves
3. **Monitor funding rates** - Holding costs for perpetual futures
4. **Size positions appropriately** - Never risk more than you can afford to lose
5. **Use isolated margin for high-risk trades** - Limits potential losses

## Next Steps

- [Place Your First Order](./place-order.md) - Trading basics
- [API Reference](/docs/category/bitzoom-api) - Full endpoint documentation
- [Error Codes](../errors.md) - Troubleshoot issues
