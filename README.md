# Futures.doc

This doc is built by [Docusaurus 3](https://docusaurus.io/), a modern static website generator.  
Plugin: [docusaurus-plugin-openapi-docs](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs)

## 交易所项目文档链接

### 产品相关

- [合约公式汇总](https://docs.google.com/spreadsheets/d/1PJxpXmbnBYxU965aQyfm_pdSvbUDrN3mGlkC2rXftys/edit?gid=1246063347#gid=1246063347)
- [合约文案修改记录](https://docs.google.com/spreadsheets/d/14Zfkg6LEgxql3GzP5hFZm36l8ygvAbvcGMZHi06GBJQ/edit?gid=382163087#gid=382163087)
- [合约用户行为埋点记录](https://docs.google.com/spreadsheets/d/1cz53I0bdorZtgBYrDjP5ZMv3uZ6TBGWbnJ8tSAU0bPc/edit?gid=1711655534#gid=1711655534)
- [接口响应字段定义](https://docs.google.com/document/d/1RbFp7sRpFuXlezNXV3OUUXJE086_rNMOdkxunIxEcSE/edit?usp=docs_home&ouid=107582496428277930879&ths=true&pli=1)

### 案例说明

- [关于全仓可划转金额的说明](https://docs.google.com/document/d/1RbFp7sRpFuXlezNXV3OUUXJE086_rNMOdkxunIxEcSE/edit?usp=docs_home&ouid=107582496428277930879&ths=true&pli=1)
- [双向持仓公式案例](https://docs.google.com/document/d/1A9txd2oQ_0OESnYAkAhVviuYmDZSII3oYDpA5eC2yZA/edit?tab=t.0#heading=h.k9btko1d4ns2)
- [全仓模式下的订单类型](https://docs.google.com/spreadsheets/d/1sh4OZO4vcLVmWX-xj0jyHB-kgVKVQJiLyWdUi6TL9gk/edit?gid=78915208#gid=78915208)

### 测试相关

- [合约业务用例-用户(旧)](https://docs.google.com/spreadsheets/d/1sh4OZO4vcLVmWX-xj0jyHB-kgVKVQJiLyWdUi6TL9gk/edit?gid=2116582050#gid=2116582050)
- [合约业务用例-用户(新)-等待更新](https://docs.google.com/spreadsheets/d/15t3qKwz4cP3arCijcyU4V3l2dEmAL8gYWa9DhuU7YTM/edit?gid=1135667496#gid=1135667496)
- [合约后台管理员用例](https://docs.google.com/spreadsheets/d/1mijfje-p2Pl1nuRxyl0a7y3ml81QxIZ7DKW5IN6Co54/edit?gid=1135667496#gid=1135667496)
- [合约特殊场景测试用例](https://docs.google.com/spreadsheets/d/14Zfkg6LEgxql3GzP5hFZm36l8ygvAbvcGMZHi06GBJQ/edit?gid=505653708#gid=505653708)
- [合约演示用测试用例](https://docs.google.com/spreadsheets/d/1GZkYDTW0IpnmpO3i9sU6sJe4jbS2oDw6DYXMddODgKU/edit?gid=1217277829#gid=1217277829)

### 运维问题反馈

- [问题清单](https://docs.google.com/spreadsheets/d/14Zfkg6LEgxql3GzP5hFZm36l8ygvAbvcGMZHi06GBJQ/edit?gid=1295395322#gid=1295395322)

### Usage

```bash
npx create-docusaurus@3.5.2 my-website --package-manager yarn
```

> When prompted to select a template choose `Git repository`.

Template Repository URL:

```bash
https://github.com/PaloAltoNetworks/docusaurus-template-openapi-docs.git
```

> When asked how the template repo should be cloned choose "copy" (unless you know better).

```bash
cd my-website
yarn
```

### Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.
