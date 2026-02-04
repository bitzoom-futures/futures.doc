---
unlisted: true
---

# Versioning and Locales Guide / 版本与多语言发布指南

This guide explains how to release and maintain docs/API versions with multiple locales.  
本指南介绍如何在多语言场景下发布和维护文档/API 版本。

## Quick Release Commands / 发布命令速查

```bash
# 0) Node
source ~/.nvm/nvm.sh
nvm use 22

# 1) Cut docs version
yarn docusaurus docs:version <version>

# 2) Register OpenAPI version in docusaurus.config.ts (bitzoom.versions)

# 3) Generate OpenAPI docs
yarn gen-docs
yarn docusaurus gen-api-docs:version bitzoom:<version>

# 4) Refresh locale metadata (if needed)
yarn docusaurus write-translations --locale zh-Hans

# 5) Build and verify
yarn build
```

## 1) Prerequisites / 前置条件

- Use Node.js 22 (recommended) or Node.js 18+.
- Ensure `docusaurus.config.ts` includes:
  - `i18n.locales` (for example: `en`, `zh-Hans`)
  - docs version dropdown and locale dropdown in navbar.

## 2) Add a New Version (Example: v2.0) / 新增版本（示例：v2.0）

### Step A: Freeze docs content / 冻结文档内容

Keep latest work in `docs/` until release-ready, then cut the version.
在 `docs/` 中完成最新内容，准备发布后再切版本。

```bash
source ~/.nvm/nvm.sh
nvm use 22
yarn docusaurus docs:version 2.0
```

This creates:
- `versioned_docs/version-2.0/...`
- updates `versions.json`

### Step B: Register OpenAPI version / 注册 OpenAPI 版本

In `docusaurus.config.ts`, add a new entry under `bitzoom.versions`:

```ts
'2.0': {
  specPath: 'examples/bitzoom.gateway.json',
  outputDir: 'versioned_docs/version-2.0/bitzoom',
  label: '2.0',
  baseUrl: '/docs/2.0'
}
```

### Step C: Generate versioned API docs / 生成版本化 API 文档

```bash
yarn docusaurus gen-api-docs:version bitzoom:2.0
```

### Step D: Build and verify / 构建并验证

```bash
yarn build
```

Verify both locales and versions in dropdowns.
确认语言下拉与版本下拉都正常显示。

## 3) Update Current + Existing Version / 更新当前版本与历史版本

### Current (`Next`) docs / 当前版本（Next）

Edit files in:
- `docs/...`
- `examples/bitzoom.json` (OpenAPI source of truth)

Then regenerate API docs:

```bash
yarn gen-docs
```

### Existing version (for example `1.0`) / 历史版本（如 `1.0`）

Edit versioned docs directly:
- `versioned_docs/version-1.0/...`

Regenerate versioned API docs:

```bash
yarn docusaurus gen-api-docs:version bitzoom:1.0
```

## 4) Locale Translation Workflow / 多语言翻译流程

### Initialize translation metadata / 初始化翻译元数据

```bash
yarn docusaurus write-translations --locale zh-Hans
```

### Translate current docs / 翻译当前版本文档

Add translated files to:
- `i18n/zh-Hans/docusaurus-plugin-content-docs/current/...`

### Translate versioned docs / 翻译历史版本文档

Add translated files to:
- `i18n/zh-Hans/docusaurus-plugin-content-docs/version-<version>/...`
- example: `i18n/zh-Hans/docusaurus-plugin-content-docs/version-1.0/...`

### Important rule / 重要规则

Do **not** manually maintain generated API MDX as primary source.  
请不要把生成后的 API MDX 作为主维护源。

Use OpenAPI spec (`examples/bitzoom.json`) as source of truth, then regenerate.
应以 OpenAPI 规范（`examples/bitzoom.json`）为准，再执行生成命令。

## 5) Remove a Version / 删除版本

1. Clean versioned API docs:
   ```bash
   yarn docusaurus clean-api-docs:version bitzoom:1.0
   ```
2. Remove docs snapshots:
   - `versioned_docs/version-1.0`
   - `versioned_sidebars/version-1.0-sidebars.json`
3. Remove `1.0` from `versions.json`.
4. Remove `1.0` entry from `bitzoom.versions` in `docusaurus.config.ts`.
5. Rebuild:
   ```bash
   yarn build
   ```

## 6) Release Checklist / 发布检查清单

- `versions.json` updated
- `docs/bitzoom/versions.json` updated
- `versioned_docs/version-<x.y>/...` exists
- `versioned_sidebars/version-<x.y>-sidebars.json` exists
- locale files added under `i18n/zh-Hans/...`
- `yarn build` passes for all locales
