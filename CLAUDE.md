# Bitzoom Futures API Documentation

Docusaurus 3 documentation site with OpenAPI integration, interactive WebSocket/Wallet playgrounds, and bilingual support (en, zh-Hans).

## Commands

```bash
yarn start              # Dev server on port 3000 (base path: /docs/)
yarn build              # Full build: fetch spec → build gateway spec → gen docs → build site
yarn build:local        # Quick local build (skips API doc generation)
yarn serve              # Serve production build
```

### API Doc Pipeline

```bash
node scripts/fetch-gateway-spec.cjs   # Fetch OpenAPI spec from gateway → examples/bitzoom.json
node scripts/build-gateway-spec.cjs   # Filter to "gateway" tag, replace URLs → examples/bitzoom.gateway.json
yarn gen-docs                          # Generate API docs from spec → docs/bitzoom/
```

## Project Structure

```
docs/                    # Documentation content (md/mdx)
  bitzoom/               # Auto-generated OpenAPI docs (do not edit manually)
  guides/                # Trading guides
  user-guide/            # User guides with screenshots
  websocket-test/        # WebSocket testing pages
src/
  components/            # Interactive components (WebSocketTester, WalletPlayground, NavbarLogin)
  theme/ApiExplorer/     # Custom OpenAPI theme overrides (28 components)
  css/custom.css         # Global styles and theme variables
  context/               # Auth context (Casdoor SSO)
scripts/                 # Build scripts (fetch-gateway-spec, build-gateway-spec, sync-doc-base-urls)
examples/                # OpenAPI spec files (bitzoom.json, bitzoom.gateway.json)
static/                  # Static assets (images, APK)
i18n/                    # Translations (zh-Hans)
```

## Conventions

- **URLs**: Internal IPs (e.g. `http://119.8.50.236:*`) are replaced with `https://test.riverwa.com` by build-gateway-spec.cjs. Never commit internal IPs to generated docs.
- **CSS overrides**: OpenAPI theme styles require high specificity. Use `[class]` doubling (e.g. `.openapi-explorer__details-summary[class]`) to override plugin styles.
- **API docs**: Files in `docs/bitzoom/` are auto-generated. Edit the spec or build scripts instead.
- **Primary color**: `#7948ff` (purple)

## Deployment

- GitHub Actions: push to `main` triggers build and deploy to GitHub Pages
- Docker: Dockerfile + docker-compose.yml + nginx.conf available for containerized deployment

## PR Conventions

- No emoji in PR titles or descriptions
- Use this footer: `Created by [Claude Code](https://claude.com/claude-code)`
