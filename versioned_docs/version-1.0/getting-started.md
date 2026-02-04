# Getting Started

Welcome to the Bitzoom Futures API. This guide will help you make your first API call.

## Overview

The Bitzoom Futures API provides programmatic access to:
- **Market Data** - Real-time prices, order books, and klines
- **Trading** - Place, modify, and cancel orders
- **Account** - Check balances, positions, and trade history
- **Wallet** - Deposits and withdrawals

## Base URL

```
http://119.8.50.236:8088
```

## Quick Start

### Step 1: Get Your API Credentials

1. Log in to your Bitzoom account
2. Navigate to **API Management**
3. Create a new API key
4. Save your API Key and Secret securely

:::warning
Never share your API secret. Store it securely and never commit it to version control.
:::

### Step 2: Make Your First Request

Test your connection with a public endpoint that doesn't require authentication:

```bash
curl -X GET "http://119.8.50.236:8088/api/gateway/ping"
```

Expected response:
```json
{
  "code": 0,
  "msg": "success"
}
```

### Step 3: Get Market Data

Fetch available trading pairs:

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/exchangeinfo"
```

### Step 4: Authenticate and Get Your Balance

Once you have your API credentials, you can access private endpoints:

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/balance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

See [Authentication](./authentication.md) for details on obtaining your JWT token.

## What's Next?

- [Authentication](./authentication.md) - Learn how to authenticate API requests
- [WebSocket Streams](./websocket.md) - Real-time market data
- [Place Your First Order](./guides/place-order.md) - Trading tutorial
- [Position Management](./guides/positions.md) - Manage your positions
- [API Reference](/docs/category/bitzoom-api) - Explore all available endpoints
- [Error Codes](./errors.md) - Complete error reference
- [FAQ](./faq.md) - Frequently asked questions

## Rate Limits

| Endpoint Type | Rate Limit |
|--------------|------------|
| Public endpoints | 10 requests/second |
| Private endpoints | 5 requests/second |
| Order placement | 10 orders/second |

:::tip
Use WebSocket streams for real-time data to reduce API calls.
:::

## Error Handling

All API responses follow this format:

```json
{
  "code": 0,
  "msg": "success",
  "data": { }
}
```

| Code | Description |
|------|-------------|
| 0 | Success |
| -1 | Unknown error |
| -1001 | Disconnected |
| -1002 | Unauthorized |
| -1003 | Rate limit exceeded |
| -1021 | Timestamp outside of recv window |
| -1022 | Invalid signature |

## Support

If you encounter any issues:
- Check the [FAQ](./faq.md) for common questions
- Review [Error Codes](./errors.md) for troubleshooting
- Join our [Discord](https://discord.gg/bitzoom)
- Email: api-support@bitzoom.com
