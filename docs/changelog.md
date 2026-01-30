# Changelog

All notable changes to the Bitzoom Futures API will be documented here.

## Versioning

The API uses semantic versioning. Changes are categorized as:
- **Added** - New features or endpoints
- **Changed** - Changes to existing functionality
- **Deprecated** - Features to be removed in future versions
- **Removed** - Features removed in this version
- **Fixed** - Bug fixes
- **Security** - Security-related changes

---

## [Unreleased]

### Planned
- WebSocket order book diff streams
- Batch order endpoint
- Historical funding rate endpoint

---

## [1.0.0] - 2024-01-15

### Added
- Initial public API release
- REST API endpoints for:
  - Market data (ticker, depth, klines, trades)
  - Account management (balance, positions)
  - Order management (place, cancel, query)
  - Wallet operations (deposit, withdraw)
- WebSocket streams for real-time data
- JWT Bearer authentication
- Rate limiting system

### Endpoints
| Category | Endpoints |
|----------|-----------|
| Gateway | `/api/gateway/ping`, `/api/gateway/time` |
| Market Data | `/api/v1/ticker/*`, `/api/v1/depth`, `/api/v1/klines` |
| Trading | `/api/v1/order`, `/api/v1/openorders`, `/api/v1/historyorder` |
| Account | `/api/v1/balance`, `/api/v1/leverage`, `/api/v1/margintype` |
| Position | `/api/v1/openpositions`, `/api/v1/positionrisk` |
| Wallet | `/api/v1/wallet/*` |

---

## Migration Guides

### Migrating from Beta to v1.0.0

If you were using the beta API, note the following changes:

1. **Base URL Change**
   ```
   # Old (Beta)
   https://beta-api.bitzoom.com

   # New (v1.0.0)
   https://api.bitzoom.com
   ```

2. **Authentication Header**
   ```
   # Old
   X-API-KEY: your_api_key

   # New
   Authorization: Bearer your_jwt_token
   ```

3. **Response Format**
   ```json
   // Old
   { "success": true, "result": { } }

   // New
   { "code": 0, "msg": "success", "data": { } }
   ```

4. **Order Side Values**
   ```
   # Old
   side: "buy" / "sell"

   # New
   side: "BUY" / "SELL"
   ```

---

## Deprecation Policy

When an API feature is deprecated:

1. **Announcement** - 90 days notice before removal
2. **Warning Period** - API returns deprecation warning header
3. **Migration Guide** - Documentation for transitioning to new approach
4. **Removal** - Feature removed after notice period

### Currently Deprecated

*No deprecations at this time.*

---

## Rate Limit Changes

| Date | Change |
|------|--------|
| 2024-01-15 | Initial limits: 10 req/s public, 5 req/s private |

---

## Breaking Changes Notice

Breaking changes will be communicated:
- Via email to registered API users
- On the [status page](https://status.bitzoom.com)
- In this changelog
- With minimum 30 days notice

---

## Subscribe to Updates

Stay informed about API changes:
- **Email**: Subscribe at [bitzoom.com/api-updates](https://bitzoom.com/api-updates)
- **Discord**: Join [discord.gg/bitzoom](https://discord.gg/bitzoom) #api-announcements
- **Twitter**: Follow [@BitzoomAPI](https://twitter.com/BitzoomAPI)
- **GitHub**: Watch this repository for releases

---

## Support

For questions about API changes:
- Email: [api-support@bitzoom.com](mailto:api-support@bitzoom.com)
- Discord: [discord.gg/bitzoom](https://discord.gg/bitzoom)
