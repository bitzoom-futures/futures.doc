# Frequently Asked Questions

## Authentication

### How do I create API credentials?

Open [API Management](/api-management), log in, select **Create API key**, choose permissions, and add an IP allowlist. Save the secret immediately; it is displayed once. Accounts can hold at most 20 keys.

### Do current private APIs accept a Bearer token?

No. Current private REST and WebSocket APIs use HMAC API keys. The login Bearer session is used only by the API Management page for key-lifecycle calls. Version 1.0 retains its legacy Bearer contract.

### Can I use one key for several applications?

It can work, but separate keys are safer. They allow independent permissions, IP restrictions, rotation, monitoring, and revocation.

### Why is “Send API Request” unavailable on a private reference page?

The documentation site never asks for your API secret. Private browser execution is disabled intentionally. Copy the operation details and sign the request in your backend or trusted command-line client using the [HMAC guide](./guides/api-key-authentication.md).

### What does “Any IP” mean?

The key has an empty IP allowlist and can be used from any source IP. Add exact IPs or CIDR ranges whenever possible.

## Signatures

### Why is my signature invalid?

Verify all seven payload lines, including the empty lines. Frequent causes are:

- Signing a different path or HTTP method
- Sorting a query incorrectly or dropping duplicate parameters
- Omitting the blank receive-window line when the header is absent
- Hashing JSON that differs from the bytes actually sent
- Using uppercase hexadecimal or the wrong secret

### Can I reuse a nonce?

No. Generate a new unpredictable nonce for every REST request and WebSocket `logon`. Replay rejection is expected behavior.

### How should I handle clock errors?

Synchronize the client clock. The default receive window is 5,000 ms and the maximum is 60,000 ms. The signed value and `X-BZ-RECVWINDOW` header must match.

## Key lifecycle

### What if I lose the API secret?

It cannot be retrieved. Create a replacement key, deploy it, verify the integration, and revoke the old key.

### Disable or revoke?

Disable is reversible and useful for a temporary pause. Revocation is immediate and permanent; use it when a key is retired or exposure is possible.

### What if I reach the 20-key limit?

Revoke an unused key before creating another. Revoked keys cannot be restored.

## WebSocket

### Why do public channels work while private channels do not?

Private channels require a successful HMAC `logon` on the current connection. Wait for `event: "success"` before subscribing.

### What happens after reconnecting?

Create a new timestamp, nonce, and signature; send `logon`; wait for success; then restore private subscriptions. Never replay the previous login message.

## Responses

### The HTTP status is successful but the operation failed. Why?

Always inspect the response envelope. Treat `success: false` or a nonzero `code` as a failure and use `errorMessage` for diagnostics.

For complete examples and troubleshooting, see [API Key Authentication](./guides/api-key-authentication.md).
