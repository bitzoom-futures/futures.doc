# Frequently Asked Questions

## General

### What is the Bitzoom Futures API?

The Bitzoom Futures API provides programmatic access to perpetual futures trading. You can use it to:
- Access real-time market data
- Place and manage orders
- Monitor positions and account balances
- Automate trading strategies

### What are the API rate limits?

| Endpoint Type | Rate Limit |
|--------------|------------|
| Public endpoints | 10 requests/second |
| Private endpoints | 5 requests/second |
| Order placement | 10 orders/second |
| WebSocket connections | 5 connections per IP |

Exceeding rate limits will result in a `-1003` error and temporary IP ban.

### Is there a testnet environment?

Yes, you can test your integration without risking real funds:

| Environment | Base URL |
|-------------|----------|
| Production | `http://119.8.50.236:8088` |
| Testnet | `https://testnet.bitzoom.com` |

Testnet API keys are separate from production keys.

---

## Authentication

### How do I get API credentials?

1. Log in to your Bitzoom account
2. Navigate to **Account** → **API Management**
3. Click **Create API Key**
4. Set permissions and IP whitelist (recommended)
5. Save your API Key and Secret securely

### My token expired. What should I do?

JWT tokens have a limited lifetime. When expired:
1. You'll receive a `-1002 Unauthorized` error
2. Request a new token using your credentials
3. Update your application with the new token

### Can I use the same API key for multiple applications?

Yes, but we recommend creating separate API keys for each application for better security and tracking.

---

## Trading

### What order types are supported?

| Order Type | Description |
|------------|-------------|
| `MARKET` | Execute immediately at best available price |
| `LIMIT` | Execute at specified price or better |
| `STOP` | Trigger market order when stop price is reached |
| `TAKE_PROFIT` | Trigger order when take-profit price is reached |
| `STOP_MARKET` | Stop-loss with market execution |
| `TAKE_PROFIT_MARKET` | Take-profit with market execution |

### What does "timeInForce" mean?

| Value | Description |
|-------|-------------|
| `GTC` | Good Till Cancel - remains until filled or canceled |
| `IOC` | Immediate Or Cancel - fill immediately, cancel unfilled portion |
| `FOK` | Fill Or Kill - fill entirely or cancel completely |
| `GTX` | Good Till Crossing - post-only, rejected if would immediately match |

### How do I set leverage?

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/leverage" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT", "leverage": 10}'
```

Maximum leverage varies by symbol. Check `/api/v1/exchangeinfo` for limits.

### Why was my order rejected?

Common rejection reasons:

| Error Code | Reason | Solution |
|------------|--------|----------|
| `-2010` | Insufficient balance | Deposit more funds or reduce order size |
| `-2015` | Invalid side | Use "BUY" or "SELL" |
| `-2018` | Invalid quantity | Check min/max quantity for the symbol |
| `-2019` | Invalid price | Price must meet tick size requirements |
| `-2021` | Order would trigger immediately | Use a different order type or price |

---

## Positions

### How do I check my open positions?

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/openpositions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### What is the difference between isolated and cross margin?

| Margin Type | Description |
|-------------|-------------|
| **Isolated** | Each position has its own margin. Liquidation affects only that position. |
| **Cross** | All positions share margin from your account balance. Higher risk but more efficient capital usage. |

### How is liquidation price calculated?

Liquidation occurs when your margin ratio falls below the maintenance margin requirement. The formula depends on:
- Entry price
- Position size
- Leverage
- Maintenance margin rate

Use the `/api/v1/positionrisk` endpoint to get your current liquidation price.

---

## WebSocket

### How do I connect to WebSocket streams?

```javascript
const ws = new WebSocket('ws://119.8.50.236:8088/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    method: 'SUBSCRIBE',
    params: ['btcusdt@ticker'],
    id: 1
  }));
};
```

### Why did my WebSocket connection drop?

Common reasons:
- **24-hour limit**: Connections are closed after 24 hours. Implement reconnection logic.
- **Inactivity**: Send a ping every 30 minutes to keep the connection alive.
- **Rate limit**: Too many subscriptions or messages.

### How many streams can I subscribe to?

- Maximum 200 streams per connection
- Maximum 5 connections per IP
- Maximum 10 subscription requests per second

---

## Account & Wallet

### How do I check my balance?

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### How long do deposits take?

| Asset | Confirmations Required | Estimated Time |
|-------|----------------------|----------------|
| BTC | 2 | ~20 minutes |
| ETH | 12 | ~3 minutes |
| USDT (TRC20) | 20 | ~1 minute |
| USDT (ERC20) | 12 | ~3 minutes |

### Why is my withdrawal pending?

Withdrawals may be delayed due to:
- Security review for large amounts
- Network congestion
- Address whitelist verification
- 2FA confirmation required

---

## Troubleshooting

### I'm getting "Invalid signature" errors

1. Verify your API secret is correct
2. Check that your system clock is synchronized
3. Ensure you're signing the correct request parameters
4. Verify the signature algorithm (HMAC-SHA256)

### API calls are timing out

1. Check your network connection
2. Increase your client timeout (we recommend 30 seconds)
3. Verify the API endpoint is correct
4. Check [status.bitzoom.com](https://status.bitzoom.com) for service issues

### I'm getting rate limited but haven't exceeded limits

1. Check if you're sharing an IP with other users (VPN, cloud hosting)
2. Implement exponential backoff on retries
3. Use WebSocket for real-time data instead of polling
4. Consider applying for a higher rate limit tier

---

## Still Have Questions?

- Join our [Discord](https://discord.gg/bitzoom) for community support
- Email [api-support@bitzoom.com](mailto:api-support@bitzoom.com) for technical issues
- Check [status.bitzoom.com](https://status.bitzoom.com) for service status
