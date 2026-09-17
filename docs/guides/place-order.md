# Place Your First Order

This flow uses public market data and an HMAC key with `READ,TRADE` permissions. The private browser controls are disabled, so run signed requests from your own trusted client.

## Prerequisites

- A funded Bitzoom account
- An API key with `READ` and `TRADE`
- An IP allowlist that includes the client’s egress IP
- A safely stored one-time secret
- The signing helper from [API Key Authentication](./api-key-authentication.md)

## 1. Inspect the market

The market catalog and price endpoints are public:

```bash
curl --fail-with-body "https://api1.riverwa.com/api/v1/exchangeinfo"
curl --fail-with-body "https://api1.riverwa.com/api/v1/ticker/price?symbol=BTCUSDT"
```

Use the returned symbol filters, price precision, and quantity precision when constructing the order.

## 2. Check available balance

Send a signed `GET /api/v1/balance`. Because it has no body, line 7 of the signing payload is the SHA-256 hash of an empty byte string. This operation requires `READ`.

## 3. Set leverage when needed

Send a signed `POST /api/v1/leverage` with the exact JSON bytes you intend to transmit. This operation requires `TRADE`.

```json
{"symbol":"BTCUSDT","leverage":10}
```

Do not reformat that JSON between calculating the body hash and sending it.

## 4. Place a limit order

Send a signed `POST /api/v1/order` with `Content-Type: application/json` and a fresh timestamp and nonce.

```json
{"symbol":"BTCUSDT","side":"BUY","type":"LIMIT","quantity":"0.001","price":"70000","clientOrderId":"bot-1234567890123"}
```

The complete Python and Node.js examples in the [signing guide](./api-key-authentication.md) sign and send this payload. Use decimal strings where the API schema permits them to avoid accidental floating-point serialization changes.

## 5. Monitor or cancel

| Action | Request | Permission |
| --- | --- | --- |
| List open orders | Signed `GET /api/v1/openorders` | `READ` |
| Query an order | Signed request shown in the API Reference | `READ` |
| Cancel an order | Signed `DELETE /api/v1/order` | `TRADE` |

Canonicalize every query independently. Repeated query keys must be preserved and sorted by key and then value.

## Production checklist

- Start with the smallest allowed order size.
- Verify symbol filters and balances before submitting.
- Use a unique `clientOrderId` to make reconciliation safer.
- Treat HTTP errors, `success: false`, and nonzero `code` as failures.
- Never retry an uncertain order with the same nonce or blindly create a second order.
- Reconcile against open orders and order history after a timeout.

See [Position Management](./positions.md) for signed position and margin operations.
