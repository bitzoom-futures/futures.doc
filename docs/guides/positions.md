# Position Management

Position and margin operations are private. Sign them with an HMAC API key; a Bearer session is not accepted by the current trading service.

## Permissions

| Operation | Permission |
| --- | --- |
| Read position risk, balance, or history | `READ` |
| Change leverage, margin type, or position mode | `TRADE` |
| Add or remove isolated margin | `TRADE` |
| Place a reduce-only closing order | `TRADE` |

Create and scope the key in [API Management](/api-management), then use the [signing guide](./api-key-authentication.md) for every private request.

## Read position risk

Send a signed `GET /api/v1/positionrisk`. If a symbol is supplied in the query, include its canonical form on line 6 of the signing payload.

Position-risk data typically includes the symbol, side, amount, entry price, mark price, unrealized PnL, liquidation price, leverage, and margin type. Treat the API response as authoritative; do not use a locally estimated liquidation price for execution decisions.

## Change leverage or margin mode

For a leverage change, sign the exact bytes sent to `POST /api/v1/leverage`:

```json
{"symbol":"BTCUSDT","leverage":10}
```

For a margin-mode change, sign the request documented for `POST /api/v1/margintype` in the [API Reference](/category/bitzoom-api).

These changes can be rejected when the account or current position state does not permit them. Check the HTTP status and response envelope before assuming a setting changed.

## Close exposure

Close exposure with a `TRADE` key by submitting an order in the opposite direction using the API’s reduce-only or close-position fields. Sign the body exactly as transmitted.

Before and after the request:

1. Read the current position and open orders.
2. Size the close request from current authoritative values.
3. Submit with a unique nonce and client order identifier.
4. Reconcile the resulting position and order state.

## WebSocket monitoring

For lower-latency balance, open-order, and position-risk updates, connect to the HMAC WebSocket service and complete `logon` before subscribing. Every reconnect requires a new signed `logon` followed by restoration of private subscriptions.

See [WebSocket Streams](../websocket.md) for the channel envelope and [API Key Authentication](./api-key-authentication.md) for the WebSocket signature.

## Risk controls

- Use the lowest practical leverage.
- Keep a server-side record of intended orders and reconcile after timeouts.
- Separate read-only monitoring from trading with different keys.
- Restrict trading keys by IP and rotate them on a schedule.
- Disable a key during investigation; revoke it if exposure is possible.
