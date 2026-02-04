# 鉴权

Bitzoom 合约 API 的私有接口使用 JWT Bearer Token 鉴权。

## 鉴权类型

| 类型 | 说明 | 适用范围 |
|------|------|----------|
| 无需鉴权 | 不需要认证 | 公共行情接口 |
| Bearer Token | 在 Authorization 头中传 JWT | 账户、交易、钱包 |

## 获取 Token

### 测试环境

```bash
curl -X GET "https://api.bitzoom.com/api/servermanage/testtoken?userid=YOUR_USER_ID"
```

### 生产环境

1. 登录 Bitzoom
2. 进入 **API Management**
3. 生成 API 凭证
4. 用凭证换取 JWT Token

## 使用方式

```bash
curl -X GET "https://api.bitzoom.com/api/v1/balance"   -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Token 过期

Token 过期后通常会返回 `-1002 Unauthorized`：
1. 重新申请 Token
2. 更新你的服务配置
3. 重试请求

:::tip 最佳实践
建议在服务端实现自动刷新 Token。
:::

## 安全建议

1. 不要在前端暴露 Token
2. 不要把 Token 硬编码到仓库
3. 使用环境变量管理密钥
4. 按需启用 IP 白名单
5. 监控异常调用

```bash
export BITZOOM_API_TOKEN="your_jwt_token"
curl -X GET "https://api.bitzoom.com/api/v1/balance"   -H "Authorization: Bearer $BITZOOM_API_TOKEN"
```

## 常见问题排查

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `-1002 Unauthorized` | Token 无效或过期 | 重新获取 Token |
| `-1022 Invalid signature` | 签名格式不正确 | 检查签名逻辑 |
| `401 Unauthorized` | 缺少 Authorization 头 | 添加 Bearer Token |

## 下一步

- [快速开始](./getting-started.md)
- [下第一笔订单](./guides/place-order.md)
- [API 参考](/docs/category/bitzoom-api)
