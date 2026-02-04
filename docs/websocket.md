# WebSocket Streams

Bitzoom WebSocket uses a channel-based JSON protocol for real-time public and private updates.

## Connection

### Base URLs

| Environment | Server Base URL |
|-------------|-----------------|
| Gateway Spec Server | `119.8.50.236:8088` |

### URL Scheme Rule

- Use `ws://` when server host is an IP.
- Use `wss://` when server host is a domain.

Examples:

- `119.8.50.236:8088` -> `ws://119.8.50.236:8088/ws`
- `api.example.com` -> `wss://api.example.com/ws`

### JavaScript Connection Example

```javascript
const ws = new WebSocket('ws://119.8.50.236:8088/ws');

ws.onopen = () => console.log('connected');
ws.onmessage = (event) => {
  // A frame may contain multiple JSON objects separated by newlines.
  const lines = String(event.data).split('\n').filter(Boolean);
  lines.forEach((line) => {
    try {
      console.log(JSON.parse(line));
    } catch {
      console.warn('invalid json line', line);
    }
  });
};
ws.onclose = () => console.log('disconnected');
ws.onerror = (error) => console.error('ws error', error);
```

## Protocol

### Request (client -> server)

```json
{
  "channel": "channelName",
  "event": "sub",
  "data": {}
}
```

`event` must be `sub` or `unsub` for request messages.

### Response/Event (server -> client)

```json
{
  "channel": "channelName",
  "event": "sub",
  "data": {}
}
```

`event` can be one of:

- `sub` (subscription confirmation)
- `unsub` (unsubscription confirmation)
- `success` (generic success, including auth success)
- `error` (request failure)
- `<subId>` (stream data events for an active subscription)

## Authentication (`logon`)

Private channels require successful `logon` before subscribing.

### Request

```json
{
  "channel": "logon",
  "event": "sub",
  "data": { "token": "jwt_token" }
}
```

### Success Response

```json
{
  "channel": "logon",
  "event": "success",
  "data": {}
}
```

### Error Response

```json
{
  "channel": "logon",
  "event": "error",
  "data": {}
}
```

## Subscribe / Unsubscribe

### Subscribe Request

```json
{
  "channel": "/api/v1/ticker",
  "event": "sub",
  "data": { "symbol": "BTCUSDT" }
}
```

### Subscribe Confirmation

```json
{
  "channel": "/api/v1/ticker",
  "event": "sub",
  "data": { "abc123": {} }
}
```

The keys in `data` are `subId` values.

### Data Push After Subscription

```json
{
  "channel": "/api/v1/ticker",
  "event": "abc123",
  "data": { "symbol": "BTCUSDT", "price": "50000.00" }
}
```

### Unsubscribe Request

```json
{
  "channel": "/api/v1/ticker",
  "event": "unsub",
  "data": { "symbol": "BTCUSDT" }
}
```

### Unsubscribe Response

```json
{
  "channel": "/api/v1/ticker",
  "event": "unsub",
  "data": "abc123"
}
```

## Available Channels

### Public Channels

| Channel | Parameters |
|---------|------------|
| `/api/v1/ticker` | `{ symbol }` |
| `/api/v1/ticker/price` | `{ symbol }` |
| `/api/v1/premiumindex` | `{ symbol }` |
| `/api/v1/ticker/hr24` | `{ symbol? }` |
| `/api/v1/depth` | `{ symbol, limit }` |
| `/api/v1/klines` | `{ symbol, interval, limit }` |
| `/api/v1/trades` | `{ symbol, limit }` |
| `/api/v1/leverage` | `{ symbol? }` |
| `/api/v1/margintype` | `{ symbol }` |
| `/api/v1/exchangeinfo` | `{}` |
| `/api/v1/adlquantile` | `{ symbol? }` |

### Private Channels (logon required)

| Channel | Parameters |
|---------|------------|
| `/api/v1/balance` | `{}` |
| `/api/v1/openorders` | `{ symbol? }` |
| `/api/v1/positionrisk` | `{ symbol? }` |

## Parsing and Routing Rules

1. Split each incoming WebSocket frame by newline (`\n`).
2. Parse each non-empty line as JSON independently.
3. Route control events (`sub`, `unsub`, `success`, `error`) as protocol responses.
4. Treat all other `event` values as `subId` stream updates.

## Error Handling

- Transport errors come from WebSocket events (`onerror`, `onclose`).
- Protocol errors are payloads with `event: "error"`.
- Always surface both kinds of errors to logs/UI for debugging.

## Reconnection Guidance

If the connection drops:

1. Reconnect after a short delay (recommended baseline: 2 seconds).
2. Send `logon` again for private channel access.
3. Resubscribe channels using their original `channel` + `data`.

## End-to-End Flow

1. Connect to `/ws`.
2. If needed, send `logon` with JWT token.
3. Send `sub` for desired channel and parameters.
4. Store returned `subId` from subscribe confirmation.
5. Consume updates where `event` equals that `subId`.
6. Send `unsub` to stop updates.
