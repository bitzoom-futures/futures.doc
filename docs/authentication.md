# Authentication

Current Bitzoom private REST and WebSocket APIs use API keys with HMAC-SHA256 signatures. Public market-data operations require no authentication.

| Context | Authentication |
| --- | --- |
| Public REST | None |
| Private REST | `X-BZ-APIKEY` plus timestamp, nonce, and HMAC signature headers |
| Public WebSocket | None |
| Private WebSocket | HMAC-signed `logon`, then subscribe |
| API-key management | Logged-in Bearer session handled by the documentation site |

Bearer sessions are only for creating, listing, enabling, disabling, and revoking API keys through [API Management](/api-management). They are not private trading credentials and should not be sent to the HMAC API service.

## Start here

1. Open [API Management](/api-management).
2. Create a key with the smallest required permission set and an IP allowlist.
3. Save the one-time secret immediately.
4. Follow the [API Key Authentication guide](./guides/api-key-authentication.md) to canonicalize, sign, and send requests.

Private REST requests use these headers:

```text
X-BZ-APIKEY
X-BZ-TIMESTAMP
X-BZ-NONCE
X-BZ-SIGNATURE
X-BZ-RECVWINDOW    # optional
```

The signature covers the exact method, path, canonical query, and body bytes. The API Explorer documents those inputs but intentionally does not execute private operations in the browser.

## Security rules

- Store secrets in a server-side secret manager or protected process environment.
- Never expose a secret in frontend code, source control, logs, or observability payloads.
- Generate a fresh nonce for every REST request and every WebSocket `logon`.
- Keep the system clock synchronized and use the smallest practical receive window.
- Give each application its own key and rotate it independently.
- Disable a key for a reversible pause; revoke it immediately if exposure is possible.

## Legacy version 1.0

Version 1.0 retains its original Bearer authentication contract. Select **1.0** in the version menu when maintaining a legacy integration. Do not mix version 1.0 Bearer examples with the current HMAC service.

## Troubleshooting

| Failure | First check |
| --- | --- |
| `401` / invalid signature | Exact seven-line payload, body bytes, path, access key, and secret |
| Timestamp outside window | System clock and `X-BZ-RECVWINDOW` |
| Replayed request rejected | A fresh nonce is required |
| `403` / permission denied | Key status, permission, and IP allowlist |
| WebSocket private channel silent | HMAC `logon` succeeded on the current connection |

See [API Key Authentication](./guides/api-key-authentication.md) for complete Python and Node.js examples and the exact signing contract.
