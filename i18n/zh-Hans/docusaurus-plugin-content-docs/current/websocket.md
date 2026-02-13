# WebSocket 实时流

Bitzoom WebSocket 使用基于 channel 的 JSON 协议，提供实时公开与私有数据推送。

## 连接

### 基础地址

| 环境 | 服务地址 |
|-------------|-----------------|
| Gateway Spec Server | `119.8.50.236:8088` |

### URL 规则

- 当服务主机是 IP 时，使用 `ws://`
- 当服务主机是域名时，使用 `wss://`

示例：

- `119.8.50.236:8088` -> `ws://119.8.50.236:8088/ws`
- `api.example.com` -> `wss://api.example.com/ws`

### JavaScript 连接示例

```javascript
const ws = new WebSocket('ws://119.8.50.236:8088/ws');

ws.onopen = () => console.log('connected');
ws.onmessage = (event) => {
  // 一帧可能包含多条 JSON，以换行分隔。
  const lines = String(event.data).split('\n').filter(Boolean);
  lines.forEach((line) => {
    try {
      console.log(JSON.parse(line));
    } catch {
      console.warn('invalid json line', line);
    }
  });
};
ws.onclose = () => console.log('disconnected');
ws.onerror = (error) => console.error('ws error', error);
```

## 协议

### 请求（client -> server）

```json
{
  "channel": "channelName",
  "event": "sub",
  "data": {}
}
```

请求中的 `event` 必须为 `sub` 或 `unsub`。

### 响应/事件（server -> client）

```json
{
  "channel": "channelName",
  "event": "sub",
  "data": {}
}
```

`event` 可能为：

- `sub`（订阅确认）
- `unsub`（退订确认）
- `success`（通用成功响应，包括鉴权成功）
- `error`（请求失败）
- `<subId>`（某个有效订阅的数据推送）

## 鉴权（`logon`）

私有频道必须先 `logon` 成功，才能订阅。

### 请求

```json
{
  "channel": "logon",
  "event": "sub",
  "data": { "token": "jwt_token" }
}
```

### 成功响应

```json
{
  "channel": "logon",
  "event": "success",
  "data": {}
}
```

### 失败响应

```json
{
  "channel": "logon",
  "event": "error",
  "data": {}
}
```

## 订阅 / 退订

### 订阅请求

```json
{
  "channel": "/api/v1/ticker",
  "event": "sub",
  "data": { "symbol": "BTCUSDT" }
}
```

### 订阅确认

```json
{
  "channel": "/api/v1/ticker",
  "event": "sub",
  "data": { "abc123": {} }
}
```

`data` 中的 key 即 `subId`。

### 订阅后的数据推送

```json
{
  "channel": "/api/v1/ticker",
  "event": "abc123",
  "data": { "symbol": "BTCUSDT", "price": "50000.00" }
}
```

### 退订请求

```json
{
  "channel": "/api/v1/ticker",
  "event": "unsub",
  "data": { "symbol": "BTCUSDT" }
}
```

### 退订响应

```json
{
  "channel": "/api/v1/ticker",
  "event": "unsub",
  "data": "abc123"
}
```

## 可用频道

### 公共频道

| Channel | 参数 |
|---------|------------|
| `/api/v1/ticker` | `{ symbol }` |
| `/api/v1/ticker/price` | `{ symbol }` |
| `/api/v1/premiumindex` | `{ symbol }` |
| `/api/v1/ticker/hr24` | `{ symbol? }` |
| `/api/v1/depth` | `{ symbol, limit }` |
| `/api/v1/klines` | `{ symbol, interval, limit }` |
| `/api/v1/trades` | `{ symbol, limit }` |
| `/api/v1/leverage` | `{ symbol? }` |
| `/api/v1/margintype` | `{ symbol }` |
| `/api/v1/exchangeinfo` | `{}` |
| `/api/v1/adlquantile` | `{ symbol? }` |

### 私有频道（需要先 logon）

| Channel | 参数 |
|---------|------------|
| `/api/v1/balance` | `{}` |
| `/api/v1/openorders` | `{ symbol? }` |
| `/api/v1/positionrisk` | `{ symbol? }` |

## 解析与路由规则

1. 每条 WebSocket 帧先按换行符（`\n`）拆分
2. 每一行非空内容单独按 JSON 解析
3. `sub` / `unsub` / `success` / `error` 作为协议控制事件处理
4. 其余 `event` 视作 `subId` 对应的数据流更新

## 错误处理

- 传输层错误来自 WebSocket 事件（`onerror`、`onclose`）
- 协议层错误表现为 `event: "error"` 的消息体
- 调试时应同时暴露两类错误到日志/UI

## 重连建议

连接断开时：

1. 短暂延迟后重连（建议基线：2 秒）
2. 私有频道先重新发送 `logon`
3. 使用原始 `channel` + `data` 重新订阅

## 端到端流程

1. 连接 `/ws`
2. 如需私有频道，先发送带 JWT 的 `logon`
3. 对目标频道发送 `sub` 与参数
4. 从订阅确认中保存返回 `subId`
5. 消费 `event == subId` 的推送数据
6. 需要停止时发送 `unsub`
