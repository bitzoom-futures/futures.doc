# Error Codes Reference

All API responses follow a standard format. When an error occurs, the response includes an error code and message.

## Response Format

### Success Response

```json
{
  "code": 0,
  "msg": "success",
  "data": { }
}
```

### Error Response

```json
{
  "code": -1001,
  "msg": "Disconnected from server"
}
```

---

## General Errors (1xxx)

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `-1000` | Unknown error | An unexpected error occurred | Retry the request. If persistent, contact support |
| `-1001` | Disconnected | Internal error; connection dropped | Retry the request |
| `-1002` | Unauthorized | Invalid or expired token | Refresh your JWT token |
| `-1003` | Rate limit exceeded | Too many requests | Implement rate limiting and exponential backoff |
| `-1004` | Endpoint not found | Invalid API endpoint | Check the endpoint URL |
| `-1005` | Invalid content type | Wrong Content-Type header | Use `application/json` |
| `-1006` | Unexpected response | Server returned invalid data | Retry; contact support if persistent |
| `-1007` | Timeout | Request timed out | Retry with longer timeout |
| `-1008` | Server busy | Server temporarily overloaded | Wait and retry |
| `-1010` | Error message received | Generic error | Check the `msg` field for details |

---

## Request Errors (11xx)

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `-1100` | Illegal characters | Request contains invalid characters | Remove special characters from parameters |
| `-1101` | Too many parameters | Request exceeds parameter limit | Reduce number of parameters |
| `-1102` | Mandatory parameter missing | Required field not provided | Include all required parameters |
| `-1103` | Unknown parameter | Unrecognized parameter sent | Remove invalid parameters |
| `-1104` | Unread parameters | Parameters not processed | Check parameter format |
| `-1105` | Parameter empty | Required parameter is empty | Provide a value for the parameter |
| `-1106` | Parameter not required | Sent unnecessary parameter | Remove the parameter |
| `-1111` | Invalid precision | Too many decimal places | Reduce decimal precision |
| `-1112` | No open orders | No orders exist for the symbol | Verify you have open orders |
| `-1114` | Invalid time in force | Unknown timeInForce value | Use GTC, IOC, FOK, or GTX |
| `-1115` | Invalid order type | Unknown order type | Use MARKET, LIMIT, STOP, etc. |
| `-1116` | Invalid side | Unknown order side | Use BUY or SELL |
| `-1117` | Empty new client order id | newClientOrderId cannot be empty | Provide a valid client order ID |
| `-1118` | Empty original client order id | origClientOrderId cannot be empty | Provide a valid original order ID |
| `-1119` | Invalid interval | Unknown kline interval | Use valid intervals (1m, 5m, 1h, etc.) |
| `-1120` | Invalid symbol | Unknown trading symbol | Check available symbols via exchangeinfo |
| `-1121` | Invalid symbol status | Symbol is not trading | Symbol may be in break or maintenance |
| `-1125` | Invalid listen key | WebSocket listen key invalid | Generate a new listen key |
| `-1127` | Lookup interval too large | Time range exceeds limit | Reduce the time range |
| `-1128` | Invalid combination | Parameter combination invalid | Check parameter requirements |
| `-1130` | Invalid data | Data format invalid | Verify data format |

---

## Signature Errors (12xx)

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `-1021` | Timestamp outside recv window | Request timestamp too old/new | Sync your system clock |
| `-1022` | Invalid signature | Signature verification failed | Check your signing logic |

### Fixing Signature Errors

1. **Verify timestamp**: Must be within 5000ms of server time
   ```bash
   curl http://119.8.50.236:8088/api/gateway/time
   ```

2. **Check signature algorithm**: Use HMAC-SHA256

3. **Verify parameter order**: Parameters must be sorted alphabetically

4. **Check encoding**: URL-encode all parameter values

---

## Order Errors (20xx)

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `-2010` | Insufficient balance | Not enough margin | Deposit funds or reduce order size |
| `-2011` | Order not found | Order ID doesn't exist | Verify the order ID |
| `-2012` | Order cancelled | Order was already cancelled | No action needed |
| `-2013` | Order filled | Order was already filled | No action needed |
| `-2014` | Invalid API key format | API key malformed | Check your API key |
| `-2015` | Invalid order side | Side must be BUY or SELL | Correct the side parameter |
| `-2016` | No trading window | Trading not allowed | Market may be closed |
| `-2017` | Order archived | Order moved to history | Query history endpoint |
| `-2018` | Invalid quantity | Quantity out of bounds | Check min/max quantity |
| `-2019` | Invalid price | Price out of bounds | Check price limits |
| `-2020` | Invalid stop price | Stop price invalid | Verify stop price logic |
| `-2021` | Order would trigger immediately | Stop order price too close | Adjust stop price |
| `-2022` | Quantity too low | Below minimum quantity | Increase order quantity |
| `-2023` | Reduce only rejected | Cannot reduce position | Check position exists |
| `-2024` | Position side mismatch | Position side doesn't match | Check hedge mode settings |
| `-2025` | Position side not match | Wrong position side | Use correct position side |
| `-2026` | Insufficient position | Cannot close more than held | Reduce close quantity |
| `-2027` | Order being processed | Order is still processing | Wait and check status |
| `-2028` | Order cancel rejected | Cannot cancel order | Order may be filled/cancelled |

---

## Position Errors (21xx)

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `-2100` | Position mode already set | Mode already configured | No change needed |
| `-2101` | Position mode change failed | Cannot change position mode | Close all positions first |
| `-2102` | Invalid position side | Position side invalid | Use LONG, SHORT, or BOTH |
| `-2103` | Position not found | No position exists | Verify symbol and position |
| `-2104` | Leverage too high | Exceeds maximum leverage | Reduce leverage |
| `-2105` | Leverage too low | Below minimum leverage | Increase leverage |

---

## Margin Errors (22xx)

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `-2200` | Margin type already set | Already using this margin type | No change needed |
| `-2201` | Cannot change margin type | Has open positions | Close positions first |
| `-2202` | Insufficient margin | Not enough margin | Add more margin |
| `-2203` | Cannot add margin | Position doesn't exist | Open a position first |
| `-2204` | Cannot remove margin | Would cause liquidation | Remove less margin |

---

## WebSocket Errors (30xx)

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `-3000` | WebSocket error | General WebSocket error | Reconnect |
| `-3001` | Invalid message | Malformed message | Check message format |
| `-3002` | Invalid method | Unknown method | Use valid methods (SUBSCRIBE, etc.) |
| `-3003` | Invalid params | Invalid parameters | Check parameter format |
| `-3004` | Too many subscriptions | Exceeded subscription limit | Reduce subscriptions |
| `-3005` | Listen key expired | User data stream key expired | Generate new listen key |
| `-3006` | Connection limit | Too many connections | Close unused connections |

---

## HTTP Status Codes

In addition to API error codes, standard HTTP status codes indicate request outcomes:

| Status | Meaning | Description |
|--------|---------|-------------|
| `200` | OK | Request successful |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Authentication failed |
| `403` | Forbidden | No permission for this action |
| `404` | Not Found | Endpoint doesn't exist |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `502` | Bad Gateway | Upstream error |
| `503` | Service Unavailable | Service temporarily unavailable |
| `504` | Gateway Timeout | Request timeout |

---

## Best Practices

### Error Handling

```python
import requests

def api_request(endpoint, params=None):
    response = requests.get(f"http://119.8.50.236:8088{endpoint}", params=params)
    data = response.json()

    if data.get("code") != 0:
        error_code = data.get("code")
        error_msg = data.get("msg")

        if error_code == -1003:
            # Rate limited - implement backoff
            time.sleep(60)
            return api_request(endpoint, params)
        elif error_code == -1002:
            # Token expired - refresh and retry
            refresh_token()
            return api_request(endpoint, params)
        else:
            raise Exception(f"API Error {error_code}: {error_msg}")

    return data["data"]
```

### Retry Strategy

For transient errors (`-1001`, `-1007`, `-1008`), implement exponential backoff:

```python
import time

def retry_with_backoff(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = (2 ** attempt) + random.random()
            time.sleep(wait_time)
```
