# 常见问题

## 通用问题

### 什么是 Bitzoom 合约 API？

Bitzoom 合约 API 提供永续合约交易的程序化访问能力。你可以：
- 获取实时行情数据
- 下单并管理订单
- 监控仓位与账户余额
- 自动化执行交易策略

### API 速率限制是多少？

| 接口类型 | 速率限制 |
|--------------|------------|
| 公开接口 | 10 请求/秒 |
| 私有接口 | 5 请求/秒 |
| 下单接口 | 10 单/秒 |
| WebSocket 连接 | 每个 IP 最多 5 条连接 |

超过速率限制会返回 `-1003`，并可能触发临时 IP 封禁。

### 有测试网环境吗？

有。你可以在不承担真实资金风险的前提下进行联调：

| 环境 | Base URL |
|-------------|----------|
| Production | `http://119.8.50.236:8088` |
| Testnet | `https://testnet.bitzoom.com` |

测试网 API Key 与生产环境分离，不能互用。

---

## 鉴权

### 如何获取 API 凭证？

1. 登录你的 Bitzoom 账户
2. 进入 **Account** → **API Management**
3. 点击 **Create API Key**
4. 设置权限与 IP 白名单（推荐）
5. 安全保存 API Key 与 Secret

### Token 过期了怎么办？

JWT 有有效期。过期后：
1. 你会收到 `-1002 Unauthorized`
2. 使用凭证重新申请 Token
3. 将应用更新到新 Token

### 可以多个应用共用同一个 API Key 吗？

可以，但更推荐每个应用使用独立 API Key，以提升安全性与可追踪性。

---

## 交易

### 支持哪些订单类型？

| 订单类型 | 说明 |
|------------|-------------|
| `MARKET` | 按当前最优价格立即成交 |
| `LIMIT` | 在指定价格或更优价格成交 |
| `STOP` | 达到触发价后触发市价单 |
| `TAKE_PROFIT` | 达到止盈价后触发订单 |
| `STOP_MARKET` | 市价止损单 |
| `TAKE_PROFIT_MARKET` | 市价止盈单 |

### `timeInForce` 是什么意思？

| 值 | 说明 |
|-------|-------------|
| `GTC` | Good Till Cancel，直到成交或手动撤销 |
| `IOC` | Immediate Or Cancel，立即成交，未成交部分撤销 |
| `FOK` | Fill Or Kill，必须全部立即成交，否则整单撤销 |
| `GTX` | Good Till Crossing，仅挂单，若会立即成交则拒绝 |

### 如何设置杠杆？

```bash
curl -X POST "http://119.8.50.236:8088/api/v1/leverage" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT", "leverage": 10}'
```

不同交易对的最大杠杆不同，请通过 `/api/v1/exchangeinfo` 查看限制。

### 为什么订单被拒绝？

常见原因：

| 错误码 | 原因 | 解决方案 |
|------------|--------|----------|
| `-2010` | 保证金不足 | 追加资金或降低下单量 |
| `-2015` | side 参数非法 | 使用 `BUY` 或 `SELL` |
| `-2018` | 下单数量非法 | 检查该交易对最小/最大下单量 |
| `-2019` | 下单价格非法 | 价格需满足最小变动单位 |
| `-2021` | 条件单会立即触发 | 调整订单类型或价格 |

---

## 仓位

### 如何查看当前仓位？

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/openpositions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 逐仓和全仓有什么区别？

| 保证金类型 | 说明 |
|-------------|-------------|
| **Isolated（逐仓）** | 每个仓位独立保证金，强平仅影响该仓位 |
| **Cross（全仓）** | 所有仓位共享账户保证金，风险更高但资金效率更高 |

### 强平价格如何计算？

当保证金率低于维持保证金要求时会触发强平。其计算与以下因素有关：
- 开仓价格
- 仓位数量
- 杠杆倍数
- 维持保证金率

建议通过 `/api/v1/positionrisk` 直接获取当前强平价格。

---

## WebSocket

### 如何连接 WebSocket？

```javascript
const ws = new WebSocket('ws://119.8.50.236:8088/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    method: 'SUBSCRIBE',
    params: ['btcusdt@ticker'],
    id: 1
  }));
};
```

### 为什么 WebSocket 会断开？

常见原因：
- **24 小时连接上限**：连接会在 24 小时后被服务端主动断开，请实现重连逻辑
- **空闲超时**：建议每 30 分钟发送一次 ping 保活
- **频率限制**：订阅或消息发送过快

### 单条连接最多可订阅多少流？

- 每连接最多 200 个流
- 每 IP 最多 5 条连接
- 每秒最多 10 次订阅请求

---

## 账户与钱包

### 如何查询余额？

```bash
curl -X GET "http://119.8.50.236:8088/api/v1/balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 充值多久到账？

| 资产 | 所需确认数 | 预计时间 |
|-------|----------------------|----------------|
| BTC | 2 | 约 20 分钟 |
| ETH | 12 | 约 3 分钟 |
| USDT (TRC20) | 20 | 约 1 分钟 |
| USDT (ERC20) | 12 | 约 3 分钟 |

### 为什么提现一直处理中？

提现延迟常见原因：
- 大额提现触发安全审核
- 链上网络拥堵
- 提现地址白名单校验
- 等待 2FA 二次确认

---

## 故障排查

### 我遇到了 `Invalid signature`

1. 确认 API Secret 正确
2. 检查系统时钟是否同步
3. 确认签名参数与请求参数一致
4. 确认签名算法为 HMAC-SHA256

### API 调用超时怎么办？

1. 检查网络连通性
2. 提高客户端超时时间（建议 30 秒）
3. 核对接口地址是否正确
4. 查看 [status.bitzoom.com](https://status.bitzoom.com) 是否存在服务异常

### 我没有超限却被限流了

1. 检查是否与其他用户共享 IP（例如 VPN、云主机）
2. 重试时实现指数退避
3. 实时数据改用 WebSocket，减少轮询
4. 申请更高限额等级

---

## 还有问题？

- 加入 [Discord](https://discord.gg/bitzoom) 获取社区支持
- 技术问题发送邮件至 [api-support@bitzoom.com](mailto:api-support@bitzoom.com)
- 服务状态查看 [status.bitzoom.com](https://status.bitzoom.com)
