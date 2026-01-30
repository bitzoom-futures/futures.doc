# Authentication

The Bitzoom Futures API uses JWT (JSON Web Token) Bearer authentication for private endpoints.

## Authentication Types

| Type | Description | Required For |
|------|-------------|--------------|
| **None** | No authentication needed | Public market data |
| **Bearer Token** | JWT in Authorization header | Account, trading, wallet |

## Getting Your Token

### For Testing

Get a test token for development:

```bash
curl -X GET "https://api.bitzoom.com/api/servermanage/testtoken?userid=YOUR_USER_ID"
```

### For Production

1. Log in to your Bitzoom account
2. Navigate to **API Management**
3. Generate your API credentials
4. Use the credentials to obtain a JWT token

## Using the Token

Include the JWT token in the `Authorization` header:

```bash
curl -X GET "https://api.bitzoom.com/api/v1/balance" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Code Examples

### Python

```python
import requests

BASE_URL = "https://api.bitzoom.com"
TOKEN = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Get account balance
response = requests.get(f"{BASE_URL}/api/v1/balance", headers=headers)
print(response.json())
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'https://api.bitzoom.com';
const TOKEN = 'your_jwt_token';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Get account balance
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
    req, _ := http.NewRequest("GET", "https://api.bitzoom.com/api/v1/balance", nil)
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

## Token Expiration

JWT tokens have a limited lifetime. When your token expires:

1. You'll receive a `-1002 Unauthorized` error
2. Request a new token using your credentials
3. Update your application with the new token

:::tip Best Practice
Implement automatic token refresh in your application to handle expiration gracefully.
:::

## Security Best Practices

1. **Never expose tokens in client-side code** - Use a backend proxy
2. **Use environment variables** - Don't hardcode tokens
3. **Rotate tokens regularly** - Refresh tokens periodically
4. **Use IP whitelisting** - Restrict API access by IP when possible
5. **Monitor API usage** - Watch for unusual activity

```bash
# Store token in environment variable
export BITZOOM_API_TOKEN="your_jwt_token"

# Use in your scripts
curl -X GET "https://api.bitzoom.com/api/v1/balance" \
  -H "Authorization: Bearer $BITZOOM_API_TOKEN"
```

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `-1002 Unauthorized` | Invalid or expired token | Get a new token |
| `-1022 Invalid signature` | Malformed token | Check token format |
| `401 Unauthorized` | Missing Authorization header | Add Bearer token header |

## Next Steps

- [Getting Started](./getting-started.md) - Back to overview
- [Place Your First Order](./guides/place-order.md) - Start trading
- [API Reference](/docs/category/bitzoom-api) - Explore all endpoints
