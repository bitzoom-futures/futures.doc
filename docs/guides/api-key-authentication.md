# API Key Authentication

Bitzoom uses HMAC-SHA256 credentials for current private REST requests and private WebSocket channels. Your API secret stays in your application; Bitzoom receives only the access key, request metadata, and signature.

:::warning Keep the secret server-side
Never put an API secret in browser code, a mobile binary, source control, analytics, support tickets, or logs. The secret is displayed only once when the key is created.
:::

## Service boundaries

Use the service that matches the job. A credential intended for one boundary is not accepted at another.

| Purpose | Default service | Authentication |
| --- | --- | --- |
| Create and manage API keys | `BITZOOM_MANAGEMENT_GATEWAY_URL` (default: `https://test1.riverwa.com`) | Bitzoom login Bearer session |
| Public and private REST | `https://api1.riverwa.com` | Public: none; private: HMAC headers |
| Public and private WebSocket | `wss://api1.riverwa.com/ws` | Public: none; private: HMAC `logon` |

Bearer is used only by the API Management page and its key-lifecycle requests. Do not send a Bearer session to the HMAC REST or WebSocket service.

## Create a safe API key

1. Open [API Management](/api-management) and log in with your Bitzoom account.
2. Select **Create API key**.
3. Give the key a label that identifies one application or deployment.
4. Select at least one permission. New keys start with `READ`.
5. Add the exact source IPs or CIDR ranges used by the application whenever possible.
6. Create the key, copy the access key and one-time secret separately, and acknowledge that the secret is saved.

The secret cannot be retrieved later. If it is lost or exposed, revoke the key and create a replacement. Each account can hold at most 20 keys. Use separate keys for separate applications so one integration can be disabled or rotated without affecting another.

### Permissions

| Permission | Allows |
| --- | --- |
| `READ` | Balances, orders, fills, positions, account history, rates, and other private reads |
| `TRADE` | Orders, cancellations, leverage, position mode, margin mode, and isolated-margin changes |
| `WALLET` | Withdrawals, internal transfers, and withdrawal-address allowlisting |

An empty IP allowlist means **Any IP**. It is supported, but it removes a major protection. Use the smallest permission set and the narrowest practical IP scope—especially for `TRADE` and `WALLET` keys.

## Sign a private REST request

Every private REST request requires these headers:

| Header | Required | Value |
| --- | --- | --- |
| `X-BZ-APIKEY` | Yes | Access key from API Management |
| `X-BZ-TIMESTAMP` | Yes | Current Unix time in milliseconds |
| `X-BZ-NONCE` | Yes | A new, unpredictable value for every request |
| `X-BZ-SIGNATURE` | Yes | Lowercase hexadecimal HMAC-SHA256 |
| `X-BZ-RECVWINDOW` | No | Allowed clock window in milliseconds |

The default receive window is `5000` ms and the maximum is `60000` ms. Keep the client clock synchronized. A larger window can mask clock drift, but also lengthens the period in which a captured request could be attempted.

### The exact seven-line payload

Join exactly these seven fields with a single line-feed character (`\n`). Do not add a leading or trailing newline.

```text
timestamp
nonce
recvWindow
UPPERCASE_METHOD
path
canonicalQuery
lowercaseBodySha256Hex
```

The rules are exact:

1. `timestamp` and `nonce` must match the headers.
2. `recvWindow` must match `X-BZ-RECVWINDOW`. If the header is omitted, line 3 is empty; the two surrounding newline characters remain.
3. `method` is uppercase, such as `GET`, `POST`, or `DELETE`.
4. `path` contains only the URL path and begins with `/`. It does not include the scheme, host, query, or fragment.
5. Parse the raw query into key/value pairs, preserve duplicates and blank values, sort by key and then value, and form-URL-encode every key and value. Join pairs with `&` and key/value with `=`. Space is encoded as `+`.
6. Hash the exact body bytes sent on the wire with SHA-256 and use its lowercase hexadecimal value. Do not sign one JSON serialization and send another.
7. Use the API secret as the HMAC-SHA256 key and encode the final digest as lowercase hexadecimal.

An empty query produces an empty line 6. An empty body produces this hash:

```text
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

For example, this raw query:

```text
symbol=BTCUSDT&status=OPEN&symbol=ETHUSDT&note=a+b
```

becomes:

```text
note=a+b&status=OPEN&symbol=BTCUSDT&symbol=ETHUSDT
```

### Python: sign and send

This example uses only the Python standard library. Set `BITZOOM_API_KEY` and `BITZOOM_API_SECRET` in the process environment before running it.

```python
import hashlib
import hmac
import json
import os
import secrets
import time
from urllib.parse import parse_qsl, quote_plus
from urllib.request import Request, urlopen

API_URL = os.getenv("BITZOOM_HMAC_API_URL", "https://api1.riverwa.com").rstrip("/")
API_KEY = os.environ["BITZOOM_API_KEY"]
API_SECRET = os.environ["BITZOOM_API_SECRET"]

def canonical_query(raw_query: str) -> str:
    pairs = parse_qsl(raw_query, keep_blank_values=True)
    pairs.sort(key=lambda pair: (pair[0], pair[1]))
    return "&".join(
        f"{quote_plus(key)}={quote_plus(value)}" for key, value in pairs
    )

def sign(secret: str, timestamp: str, nonce: str,
         recv_window: str, method: str, path: str,
         raw_query: str, body: bytes) -> str:
    body_hash = hashlib.sha256(body).hexdigest()
    payload = "\n".join([
        timestamp, nonce, recv_window, method.upper(), path,
        canonical_query(raw_query), body_hash,
    ]).encode()
    return hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()

path = "/api/v1/order"
raw_query = ""
body = json.dumps({
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "quantity": "0.001",
    "price": "70000",
    "clientOrderId": "bot-1234567890123",
}, separators=(",", ":")).encode()
timestamp = str(int(time.time() * 1000))
nonce = secrets.token_hex(16)
recv_window = "5000"
signature = sign(API_SECRET, timestamp, nonce, recv_window,
                 "POST", path, raw_query, body)

request = Request(API_URL + path, data=body, method="POST", headers={
    "Content-Type": "application/json",
    "X-BZ-APIKEY": API_KEY,
    "X-BZ-TIMESTAMP": timestamp,
    "X-BZ-NONCE": nonce,
    "X-BZ-RECVWINDOW": recv_window,
    "X-BZ-SIGNATURE": signature,
})
with urlopen(request, timeout=15) as response:
    result = json.loads(response.read())
    if result.get("success") is False or int(result.get("code", 0) or 0) != 0:
        raise RuntimeError(result.get("errorMessage") or "Bitzoom rejected the request")
    print(f"Request succeeded: HTTP {response.status}")
```

### Node.js: sign and send

This example requires Node.js 18 or newer and uses no third-party packages.

```javascript
import crypto from 'node:crypto'

const API_URL = (process.env.BITZOOM_HMAC_API_URL || 'https://api1.riverwa.com').replace(/\/+$/, '')
const API_KEY = process.env.BITZOOM_API_KEY
const API_SECRET = process.env.BITZOOM_API_SECRET
if (!API_KEY || !API_SECRET) throw new Error('Set BITZOOM_API_KEY and BITZOOM_API_SECRET')

function formEncode(value) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+')
}

function canonicalQuery(rawQuery) {
  const compare = (left, right) => (left < right ? -1 : left > right ? 1 : 0)
  const pairs = Array.from(new URLSearchParams(rawQuery).entries())
  pairs.sort(([leftKey, leftValue], [rightKey, rightValue]) =>
    compare(leftKey, rightKey) || compare(leftValue, rightValue))
  return pairs.map(([key, value]) =>
    `${formEncode(key)}=${formEncode(value)}`).join('&')
}

function sign({ secret, timestamp, nonce, recvWindow,
                method, path, rawQuery, body }) {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex')
  const payload = [timestamp, nonce, recvWindow, method.toUpperCase(),
    path, canonicalQuery(rawQuery), bodyHash].join('\n')
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

const path = '/api/v1/order'
const rawQuery = ''
const body = Buffer.from(JSON.stringify({
  symbol: 'BTCUSDT', side: 'BUY', type: 'LIMIT', quantity: '0.001',
  price: '70000', clientOrderId: 'bot-1234567890123',
}))
const timestamp = Date.now().toString()
const nonce = crypto.randomBytes(16).toString('hex')
const recvWindow = '5000'
const signature = sign({ secret: API_SECRET, timestamp, nonce, recvWindow,
  method: 'POST', path, rawQuery, body })

const response = await fetch(API_URL + path, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-BZ-APIKEY': API_KEY,
    'X-BZ-TIMESTAMP': timestamp,
    'X-BZ-NONCE': nonce,
    'X-BZ-RECVWINDOW': recvWindow,
    'X-BZ-SIGNATURE': signature,
  },
  body,
})
const result = await response.json()
if (!response.ok || result.success === false || Number(result.code || 0) !== 0) {
  throw new Error(result.errorMessage || `Bitzoom rejected the request: HTTP ${response.status}`)
}
console.log(`Request succeeded: HTTP ${response.status}`)
```

Both examples are maintained as executable files in [`examples/hmac`](https://github.com/bitzoom-futures/futures.doc/tree/main/examples/hmac) and validated against shared known-answer vectors for query ordering, exact body bytes, an omitted receive window, and WebSocket signing.

## Authenticate a private WebSocket connection

Connect to `wss://api1.riverwa.com/ws`. Public channels can be subscribed immediately. Before subscribing to a private channel, send one HMAC `logon` request on the open connection.

WebSocket signing uses fixed request values:

- method: `WS`
- path: `/ws`
- canonical query: empty
- body: empty

The seven-line payload is therefore:

```text
timestamp
nonce
recvWindow
WS
/ws

e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

Generate a new timestamp, nonce, and signature, then send:

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

A successful response has `channel: "logon"` and `event: "success"`. An authentication failure has `event: "error"`. After success, subscribe to private channels such as `OpenOrders`, `Balance`, and `PositionRisk` using the normal channel envelope.

Authentication belongs to one connection only. After any disconnect:

1. Wait with exponential backoff and reconnect.
2. Generate a new timestamp, nonce, and signature.
3. Send `logon` and wait for `event: "success"`.
4. Restore private subscriptions only after the new login succeeds.

Never replay a previous `logon`. Public subscriptions may be restored without login.

## Errors and troubleshooting

Always check the HTTP status and the response envelope. Treat `success: false` or a nonzero `code` as a failure even when the HTTP request succeeded.

| Symptom | What to verify |
| --- | --- |
| `401` or authentication failed | Access key, exact path, all seven lines, body bytes, and lowercase signature |
| Invalid or duplicate nonce | Generate a fresh, unpredictable nonce for every REST request and every `logon` |
| Timestamp outside receive window | Synchronize the system clock; confirm `recvWindow` and its header match; maximum is `60000` |
| Signature differs only when query parameters repeat | Preserve duplicates, then sort by key and value before form encoding |
| `403` or permission denied | Key is enabled, has the route permission, and the source IP matches the allowlist |
| REST HTTP success but business failure | Inspect `success`, `code`, and `errorMessage` in the response envelope |
| Public WebSocket works but private channels are silent | Complete `logon` first; after reconnect, log on again before restoring private subscriptions |

For signature debugging, compare the seven fields independently in a secure development environment. Do not log the API secret, full signing payload, signature, complete private headers, or private response bodies.

## Rotate or revoke a key

For routine rotation, create a new narrowly scoped key, deploy it, confirm it works, and then revoke the old key. Disable a key when you need a reversible pause. Revoke it immediately if the secret may have been exposed; revocation is permanent.

The documentation API Explorer intentionally disables **Send API Request** for private operations. This prevents secrets from entering a browser session. Public endpoints and public WebSocket channels remain interactive.
