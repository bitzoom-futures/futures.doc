# WebSocket Streams

WebSocket connections provide real-time market data and account updates without polling the REST API.

## Connection

### Base URLs

| Environment | WebSocket URL |
|-------------|---------------|
| Production | `wss://stream.bitzoom.com/ws` |
| Testnet | `wss://stream-testnet.bitzoom.com/ws` |

### Connection Example

```javascript
const ws = new WebSocket('wss://stream.bitzoom.com/ws');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onerror = (error) => {
  console.error('Error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

## Subscribing to Streams

### Subscribe

```javascript
ws.send(JSON.stringify({
  method: 'SUBSCRIBE',
  params: ['btcusdt@ticker', 'ethusdt@ticker'],
  id: 1
}));
```

### Unsubscribe

```javascript
ws.send(JSON.stringify({
  method: 'UNSUBSCRIBE',
  params: ['btcusdt@ticker'],
  id: 2
}));
```

### List Subscriptions

```javascript
ws.send(JSON.stringify({
  method: 'LIST_SUBSCRIPTIONS',
  id: 3
}));
```

## Market Streams

### Ticker Stream

24-hour rolling window statistics for a symbol.

**Stream Name:** `<symbol>@ticker`

```javascript
ws.send(JSON.stringify({
  method: 'SUBSCRIBE',
  params: ['btcusdt@ticker'],
  id: 1
}));
```

**Payload:**
```json
{
  "e": "24hrTicker",
  "E": 1672515782136,
  "s": "BTCUSDT",
  "p": "500.00",
  "P": "1.02",
  "w": "49500.00",
  "c": "50000.00",
  "Q": "0.500",
  "o": "49500.00",
  "h": "51000.00",
  "l": "49000.00",
  "v": "10000.000",
  "q": "495000000.00",
  "O": 1672429382136,
  "C": 1672515782136,
  "F": 100,
  "L": 200,
  "n": 101
}
```

| Field | Description |
|-------|-------------|
| `e` | Event type |
| `E` | Event time (ms) |
| `s` | Symbol |
| `p` | Price change |
| `P` | Price change percent |
| `w` | Weighted average price |
| `c` | Last price |
| `Q` | Last quantity |
| `o` | Open price |
| `h` | High price |
| `l` | Low price |
| `v` | Total traded base asset volume |
| `q` | Total traded quote asset volume |
| `n` | Number of trades |

### Mini Ticker Stream

Simplified ticker with key fields only.

**Stream Name:** `<symbol>@miniTicker`

```json
{
  "e": "24hrMiniTicker",
  "E": 1672515782136,
  "s": "BTCUSDT",
  "c": "50000.00",
  "o": "49500.00",
  "h": "51000.00",
  "l": "49000.00",
  "v": "10000.000",
  "q": "495000000.00"
}
```

### All Market Tickers

**Stream Name:** `!ticker@arr`

Receives ticker updates for all symbols.

### Order Book Depth

**Stream Name:** `<symbol>@depth<levels>` or `<symbol>@depth<levels>@<speed>`

| Parameter | Options |
|-----------|---------|
| levels | 5, 10, 20 |
| speed | 100ms, 250ms, 500ms |

```javascript
// Top 10 levels, 100ms updates
ws.send(JSON.stringify({
  method: 'SUBSCRIBE',
  params: ['btcusdt@depth10@100ms'],
  id: 1
}));
```

**Payload:**
```json
{
  "e": "depthUpdate",
  "E": 1672515782136,
  "s": "BTCUSDT",
  "U": 157,
  "u": 160,
  "b": [
    ["49990.00", "1.500"],
    ["49980.00", "2.300"]
  ],
  "a": [
    ["50000.00", "0.800"],
    ["50010.00", "1.200"]
  ]
}
```

| Field | Description |
|-------|-------------|
| `b` | Bids [price, quantity] |
| `a` | Asks [price, quantity] |
| `U` | First update ID |
| `u` | Final update ID |

### Kline/Candlestick Stream

**Stream Name:** `<symbol>@kline_<interval>`

| Interval | Description |
|----------|-------------|
| `1m` | 1 minute |
| `3m` | 3 minutes |
| `5m` | 5 minutes |
| `15m` | 15 minutes |
| `30m` | 30 minutes |
| `1h` | 1 hour |
| `2h` | 2 hours |
| `4h` | 4 hours |
| `6h` | 6 hours |
| `8h` | 8 hours |
| `12h` | 12 hours |
| `1d` | 1 day |
| `3d` | 3 days |
| `1w` | 1 week |
| `1M` | 1 month |

```javascript
ws.send(JSON.stringify({
  method: 'SUBSCRIBE',
  params: ['btcusdt@kline_1h'],
  id: 1
}));
```

**Payload:**
```json
{
  "e": "kline",
  "E": 1672515782136,
  "s": "BTCUSDT",
  "k": {
    "t": 1672512000000,
    "T": 1672515599999,
    "s": "BTCUSDT",
    "i": "1h",
    "o": "49500.00",
    "c": "50000.00",
    "h": "50100.00",
    "l": "49400.00",
    "v": "1000.000",
    "n": 500,
    "x": false,
    "q": "49750000.00"
  }
}
```

| Field | Description |
|-------|-------------|
| `t` | Kline start time |
| `T` | Kline close time |
| `i` | Interval |
| `o` | Open price |
| `c` | Close price |
| `h` | High price |
| `l` | Low price |
| `v` | Volume |
| `x` | Is kline closed |

### Trade Stream

Real-time trade execution data.

**Stream Name:** `<symbol>@trade`

```json
{
  "e": "trade",
  "E": 1672515782136,
  "s": "BTCUSDT",
  "t": 12345,
  "p": "50000.00",
  "q": "0.100",
  "T": 1672515782100,
  "m": true
}
```

| Field | Description |
|-------|-------------|
| `t` | Trade ID |
| `p` | Price |
| `q` | Quantity |
| `T` | Trade time |
| `m` | Is buyer market maker |

### Aggregated Trade Stream

**Stream Name:** `<symbol>@aggTrade`

Aggregates trades that fill at the same time, price, and side.

### Mark Price Stream

**Stream Name:** `<symbol>@markPrice` or `<symbol>@markPrice@1s`

```json
{
  "e": "markPriceUpdate",
  "E": 1672515782136,
  "s": "BTCUSDT",
  "p": "50000.00",
  "i": "50010.00",
  "r": "0.00010000",
  "T": 1672531200000
}
```

| Field | Description |
|-------|-------------|
| `p` | Mark price |
| `i` | Index price |
| `r` | Funding rate |
| `T` | Next funding time |

## User Data Streams

User data streams provide real-time updates for your account. These require authentication.

### Get Listen Key

```bash
curl -X POST "https://api.bitzoom.com/api/v1/listenKey" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "code": 0,
  "data": {
    "listenKey": "pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sdf19v8a65a1"
  }
}
```

### Connect to User Data Stream

```javascript
const listenKey = 'pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sdf19v8a65a1';
const ws = new WebSocket(`wss://stream.bitzoom.com/ws/${listenKey}`);
```

### Keep Listen Key Alive

Listen keys expire after 60 minutes. Send a keepalive every 30 minutes:

```bash
curl -X PUT "https://api.bitzoom.com/api/v1/listenKey" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Account Update Event

Triggered when account balance changes.

```json
{
  "e": "ACCOUNT_UPDATE",
  "E": 1672515782136,
  "T": 1672515782100,
  "a": {
    "m": "ORDER",
    "B": [
      {
        "a": "USDT",
        "wb": "10000.00",
        "cw": "9500.00"
      }
    ],
    "P": [
      {
        "s": "BTCUSDT",
        "pa": "0.100",
        "ep": "50000.00",
        "up": "50.00"
      }
    ]
  }
}
```

| Field | Description |
|-------|-------------|
| `m` | Event reason (DEPOSIT, WITHDRAW, ORDER, FUNDING_FEE, etc.) |
| `B` | Balance updates |
| `P` | Position updates |
| `wb` | Wallet balance |
| `cw` | Cross wallet balance |
| `pa` | Position amount |
| `ep` | Entry price |
| `up` | Unrealized profit |

### Order Update Event

Triggered when an order is created, filled, or cancelled.

```json
{
  "e": "ORDER_TRADE_UPDATE",
  "E": 1672515782136,
  "T": 1672515782100,
  "o": {
    "s": "BTCUSDT",
    "c": "myOrder123",
    "S": "BUY",
    "o": "LIMIT",
    "f": "GTC",
    "q": "0.100",
    "p": "50000.00",
    "ap": "0",
    "sp": "0",
    "x": "NEW",
    "X": "NEW",
    "i": 123456789,
    "l": "0",
    "z": "0",
    "L": "0",
    "T": 1672515782100,
    "t": 0,
    "rp": "0"
  }
}
```

| Field | Description |
|-------|-------------|
| `s` | Symbol |
| `c` | Client order ID |
| `S` | Side |
| `o` | Order type |
| `q` | Original quantity |
| `p` | Original price |
| `ap` | Average price |
| `x` | Execution type (NEW, TRADE, CANCELED, EXPIRED) |
| `X` | Order status |
| `i` | Order ID |
| `l` | Last filled quantity |
| `z` | Cumulative filled quantity |
| `L` | Last filled price |
| `t` | Trade ID |
| `rp` | Realized profit |

## Connection Management

### Keep-Alive

Send a ping frame every 30 minutes to prevent disconnection:

```javascript
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.ping();
  }
}, 30 * 60 * 1000);
```

### Reconnection

Implement automatic reconnection with exponential backoff:

```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected');
      this.reconnectDelay = 1000;
      this.resubscribe();
    };

    this.ws.onclose = () => {
      console.log('Disconnected, reconnecting...');
      setTimeout(() => this.connect(), this.reconnectDelay);
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        this.maxReconnectDelay
      );
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  resubscribe() {
    // Re-subscribe to previous streams
  }
}
```

### Rate Limits

| Limit | Value |
|-------|-------|
| Connections per IP | 5 |
| Subscriptions per connection | 200 |
| Messages per second | 10 |

## Complete Example

```python
import json
import websocket
import threading

class BitzoomWebSocket:
    def __init__(self):
        self.url = "wss://stream.bitzoom.com/ws"
        self.ws = None
        self.subscriptions = []

    def on_message(self, ws, message):
        data = json.loads(message)

        if 'e' in data:
            event_type = data['e']

            if event_type == '24hrTicker':
                self.handle_ticker(data)
            elif event_type == 'trade':
                self.handle_trade(data)
            elif event_type == 'kline':
                self.handle_kline(data)
            elif event_type == 'depthUpdate':
                self.handle_depth(data)

    def handle_ticker(self, data):
        print(f"Ticker {data['s']}: {data['c']} ({data['P']}%)")

    def handle_trade(self, data):
        print(f"Trade {data['s']}: {data['q']} @ {data['p']}")

    def handle_kline(self, data):
        k = data['k']
        print(f"Kline {k['s']} {k['i']}: O={k['o']} H={k['h']} L={k['l']} C={k['c']}")

    def handle_depth(self, data):
        best_bid = data['b'][0] if data['b'] else None
        best_ask = data['a'][0] if data['a'] else None
        print(f"Depth {data['s']}: Bid={best_bid}, Ask={best_ask}")

    def on_error(self, ws, error):
        print(f"Error: {error}")

    def on_close(self, ws, close_status_code, close_msg):
        print("Connection closed")

    def on_open(self, ws):
        print("Connected")
        self.subscribe(['btcusdt@ticker', 'btcusdt@trade', 'btcusdt@kline_1m'])

    def subscribe(self, streams):
        self.subscriptions.extend(streams)
        self.ws.send(json.dumps({
            "method": "SUBSCRIBE",
            "params": streams,
            "id": 1
        }))

    def run(self):
        self.ws = websocket.WebSocketApp(
            self.url,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close,
            on_open=self.on_open
        )
        self.ws.run_forever()

if __name__ == "__main__":
    client = BitzoomWebSocket()
    client.run()
```

## Next Steps

- [Getting Started](./getting-started.md) - API overview
- [Authentication](./authentication.md) - Set up API access
- [API Reference](/docs/category/bitzoom-api) - REST API documentation
