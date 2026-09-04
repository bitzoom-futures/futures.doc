# WebSocket Streams

Bitzoom WebSocket uses a channel-based JSON protocol for public market data and private account updates.

## Connect

```text
wss://api1.riverwa.com/ws
```

Public channels are anonymous. Private channels require an HMAC-signed `logon` on the current connection.

```javascript
const ws = new WebSocket('wss://api1.riverwa.com/ws')

ws.onmessage = (event) => {
  for (const line of String(event.data).split('\n').filter(Boolean)) {
    const message = JSON.parse(line)
    // Route control events separately from subscription data events.
    console.log(message.channel, message.event)
  }
}
```

## Envelope

Client requests use:

```json
{
  "channel": "/api/v1/ticker",
  "event": "sub",
  "data": { "symbol": "BTCUSDT" }
}
```

`event` is `sub` or `unsub` for client requests. Server control responses use `sub`, `unsub`, `success`, or `error`. After subscription, the server returns a `subId`; data events use that identifier as their `event` value.

## Public subscriptions

Public channels can be subscribed immediately. They remain interactive in the [WebSocket Playground](/websocket-playground).

| Channel | Parameters |
| --- | --- |
| `/api/v1/ticker` | `{ symbol }` |
| `/api/v1/ticker/price` | `{ symbol }` |
| `/api/v1/premiumindex` | `{ symbol }` |
| `/api/v1/ticker/hr24` | `{ symbol? }` |
| `/api/v1/depth` | `{ symbol, limit }` |
| `/api/v1/klines` | `{ symbol, interval, limit }` |
| `/api/v1/trades` | `{ symbol, limit }` |
| `/api/v1/exchangeinfo` | `{}` |

## Private `logon`

Use the API secret to sign a fixed virtual request with method `WS`, path `/ws`, an empty query, and an empty body. Then send:

```json
{
  "event": "sub",
  "channel": "logon",
  "data": {
    "apiKey": "your_access_key_here",
    "timestamp": 1712345678904,
    "nonce": "a_new_unique_nonce",
    "recvWindow": "5000",
    "signature": "lowercase_hmac_sha256_here"
  }
}
```

See [API Key Authentication](./guides/api-key-authentication.md) for the exact seven-line payload and signing code. The playground replaces private authentication and subscription controls with that guide because an API secret should never enter the browser.

A successful login response has:

```json
{ "channel": "logon", "event": "success", "data": {} }
```

Wait for success before subscribing to private channels such as balance, open orders, or position risk. The key must be enabled, its IP allowlist must match, and it must have the permission required by the channel.

## Subscribe and unsubscribe

A subscribe confirmation returns a subscription identifier:

```json
{
  "channel": "/api/v1/ticker",
  "event": "sub",
  "data": { "abc123": {} }
}
```

Subsequent data may use `abc123` as the `event`. To stop it, send the same channel and parameters with `event: "unsub"`.

## Reconnect safely

1. Reconnect with exponential backoff.
2. Restore public subscriptions.
3. For private access, generate a new timestamp, nonce, and signature.
4. Send `logon` and wait for success.
5. Restore private subscriptions.

Authentication is bound to one connection. Never replay an old `logon` after reconnecting.

## Error handling

Handle transport close/error events and protocol messages with `event: "error"`. If public subscriptions work but private data is absent, confirm that `logon` succeeded on the current connection and that the key has the correct permission and IP scope.
