# WebSocket 实时流

WebSocket 可以提供实时行情与账户更新，避免频繁轮询 REST API。

## 连接地址

| 环境 | WebSocket URL |
|------|---------------|
| 生产 | `ws://119.8.50.236:8088/ws` |
| 测试 | `ws://119.8.50.236:8088/ws` |

## 连接示例

```javascript
const ws = new WebSocket('ws://119.8.50.236:8088/ws');

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log('Received:', JSON.parse(event.data));
ws.onerror = (error) => console.error('Error:', error);
ws.onclose = () => console.log('Disconnected');
```

## 订阅与取消订阅

### 订阅

```javascript
ws.send(JSON.stringify({
  method: 'SUBSCRIBE',
  params: ['btcusdt@ticker', 'ethusdt@ticker'],
  id: 1
}));
```

### 取消订阅

```javascript
ws.send(JSON.stringify({
  method: 'UNSUBSCRIBE',
  params: ['btcusdt@ticker'],
  id: 2
}));
```

### 查询当前订阅

```javascript
ws.send(JSON.stringify({
  method: 'LIST_SUBSCRIPTIONS',
  id: 3
}));
```

## 常用流

- `'<symbol>@ticker'`：24 小时行情统计
- `'<symbol>@miniTicker'`：简版行情
- `'!ticker@arr'`：全市场 ticker
- `'<symbol>@depth<levels>@<speed>'`：深度数据
- `'<symbol>@kline_<interval>'`：K 线

## 深度流参数

| 参数 | 可选值 |
|------|--------|
| levels | 5, 10, 20 |
| speed | 100ms, 250ms, 500ms |

## 最佳实践

1. 实现自动重连
2. 控制订阅数量和发送频率
3. 定期发送心跳（ping）
4. 对消息处理做幂等与去重
