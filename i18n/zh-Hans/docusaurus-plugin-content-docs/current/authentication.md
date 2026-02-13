# 鉴权

Bitzoom 合约 API 对私有接口使用 JWT（JSON Web Token）Bearer 鉴权。

## 鉴权类型

| 类型 | 说明 | 适用场景 |
|------|-------------|--------------|
| **None** | 无需鉴权 | 公开行情数据 |
| **Bearer Token** | 在 Authorization 请求头中携带 JWT | 账户、交易、钱包 |

## 获取 Token

### 测试环境

开发联调可先获取测试 Token：

```bash
curl -X GET "http://119.8.50.236:8088/api/servermanage/testtoken?userid=YOUR_USER_ID"
```

### 生产环境

1. 登录 Bitzoom 账户
2. 进入 **API Management**
3. 生成 API 凭证
4. 使用凭证换取 JWT Token

## 使用 Token

在 `Authorization` 请求头中携带 JWT：

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/balance" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 代码示例

### Python

```python
import requests

BASE_URL = "http://119.8.50.236:8088"
TOKEN = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# 查询账户余额
response = requests.get(f"{BASE_URL}/api/v1/balance", headers=headers)
print(response.json())
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'http://119.8.50.236:8088';
const TOKEN = 'your_jwt_token';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// 查询账户余额
async function getBalance() {
  const response = await client.get('/api/v1/balance');
  console.log(response.data);
}

getBalance();
```

### Go

```go
package main

import (
    "fmt"
    "io"
    "net/http"
)

func main() {
    client := &http.Client{}
    req, _ := http.NewRequest("GET", "http://119.8.50.236:8088/api/v1/balance", nil)
    req.Header.Set("Authorization", "Bearer your_jwt_token")

    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```

## Token 过期

JWT 有时效。过期后：

1. 你会收到 `-1002 Unauthorized` 错误
2. 使用凭证重新申请 Token
3. 在应用中更新新 Token

:::tip 最佳实践
在应用中实现自动刷新 Token，平滑处理过期场景。
:::

## 安全最佳实践

1. **不要在客户端代码暴露 Token** - 建议通过后端代理
2. **使用环境变量** - 不要硬编码 Token
3. **定期轮换 Token** - 周期性刷新凭证
4. **使用 IP 白名单** - 尽可能限制来源 IP
5. **监控 API 使用情况** - 及时发现异常调用

```bash
# 将 token 存入环境变量
export BITZOOM_API_TOKEN="your_jwt_token"

# 在脚本中使用
curl -X GET "http://119.8.50.236:8088/api/v1/balance" \
  -H "Authorization: Bearer $BITZOOM_API_TOKEN"
```

## 排查指南

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `-1002 Unauthorized` | Token 无效或已过期 | 重新获取 Token |
| `-1022 Invalid signature` | Token 格式或签名异常 | 检查 Token 结构 |
| `401 Unauthorized` | 未携带 Authorization 请求头 | 添加 Bearer Token 请求头 |

## 下一步

- [快速开始](./getting-started.md) - 返回总览
- [下第一笔订单](./guides/place-order.md) - 开始交易
- [API 参考](/docs/category/bitzoom-api) - 浏览全部接口
