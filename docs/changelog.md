# Changelog

## Current — 2026-08-25

### Added

- First-class [API Management](/api-management) for creating, listing, enabling, disabling, and revoking API keys.
- One-time secret display with separate copy controls and explicit saved-secret acknowledgment.
- HMAC-SHA256 authentication for current private REST operations.
- HMAC `logon` for current private WebSocket channels.
- Complete [API Key Authentication guide](./guides/api-key-authentication.md) with executable Python and Node.js examples.

### Changed

- Current private REST operations use `X-BZ-APIKEY`, timestamp, nonce, signature, and optional receive-window headers.
- The current API Reference uses the HMAC API service and marks private operations with the HMAC contract.
- Private REST send controls and private WebSocket browser controls are disabled to keep API secrets out of documentation sessions.
- Public REST operations and public WebSocket channels remain interactive.
- The navbar account menu now links to API Management and Logout; it no longer displays or copies a Bearer session.

### Compatibility

- Version 1.0 remains pinned to its original Bearer authentication contract and documentation.
- For current integrations, Bearer is limited to API-key management. Private trading uses HMAC.

## Version 1.0.0 — 2024-01-15

### Added

- Initial public API release.
- REST market-data, account, order, position, and wallet operations.
- WebSocket streams for real-time data.
- JWT Bearer authentication for version 1.0 private endpoints.
- Rate limiting.

## Migration from 1.0 Bearer to current HMAC

1. Keep the legacy integration on the 1.0 documentation until migration is ready.
2. Create a scoped key in [API Management](/api-management) and save its one-time secret.
3. Change the private API service to `https://api1.riverwa.com`.
4. Replace the Bearer header with the HMAC headers and exact seven-line signing payload.
5. Replace WebSocket token login with an HMAC `logon` message.
6. Validate body-byte handling, query ordering, nonce uniqueness, clock synchronization, permissions, and IP scope.
7. Revoke the migration key if it was exposed during testing; otherwise rotate it before production use.

See [API Key Authentication](./guides/api-key-authentication.md) for the canonical contract.
