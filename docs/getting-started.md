# Getting Started

Build a Bitzoom integration in two layers: call public market data directly, then add an HMAC API key when the application needs private account or trading access.

## Services

| Service | Default URL | Use |
| --- | --- | --- |
| HMAC REST | `https://api1.riverwa.com` | Public data and signed private operations |
| HMAC WebSocket | `wss://api1.riverwa.com/ws` | Public streams and signed private streams |
| API Management | [Open page](/api-management) | Create and control API keys |

## 1. Call a public endpoint

Public operations are unsigned and remain executable in the API Explorer.

```bash
curl --fail-with-body "https://api1.riverwa.com/api/gateway/ping"
```

Fetch the market catalog in the same way:

```bash
curl --fail-with-body "https://api1.riverwa.com/api/v1/exchangeinfo"
```

## 2. Create a private credential

Open [API Management](/api-management), log in, and create a key. `READ` is selected by default. Add `TRADE` only when the application places or changes orders, and add `WALLET` only for wallet operations.

Save the secret when it appears. It is shown once and is never returned by the key list.

:::warning
An empty IP allowlist means Any IP. Restrict production keys to the application’s exact egress IPs or CIDR ranges whenever possible.
:::

## 3. Sign the first private request

Private requests are HMAC-SHA256 signed. The signature binds the timestamp, nonce, receive window, HTTP method, path, canonical query, and exact body bytes.

Use the complete [Python or Node.js sign-and-send example](./guides/api-key-authentication.md). Set the access key and secret as process environment variables, then run the example against `https://api1.riverwa.com`.

The browser API Explorer does not accept secrets or send private operations. That guard is intentional; sign from your own backend or trusted command-line process.

## 4. Handle responses correctly

Check both the HTTP status and the response envelope. A response is a failure when `success` is `false` or `code` is nonzero, even if the HTTP status is successful.

## Next steps

- [API Key Authentication](./guides/api-key-authentication.md) — exact signing rules and complete examples
- [Place Your First Order](./guides/place-order.md) — private trading flow
- [Position Management](./guides/positions.md) — signed account and risk operations
- [WebSocket Streams](./websocket.md) — public subscriptions and private `logon`
- [API Reference](/category/bitzoom-api) — current operations and schemas
- [Error Codes](./errors.md) — response errors
