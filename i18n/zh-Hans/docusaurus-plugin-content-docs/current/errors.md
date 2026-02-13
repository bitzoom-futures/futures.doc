# 错误码参考

所有 API 响应都遵循统一格式。发生错误时，响应中会返回错误码与错误消息。

## 响应格式

### 成功响应

```json
{
  "code": 0,
  "msg": "success",
  "data": { }
}
```

### 失败响应

```json
{
  "code": -1001,
  "msg": "Disconnected from server"
}
```

---

## 通用错误（1xxx）

| Code | Message | 说明 | 解决方案 |
|------|---------|-------------|----------|
| `-1000` | Unknown error | 未知异常 | 重试请求；若持续出现请联系支持 |
| `-1001` | Disconnected | 内部连接中断 | 重试请求 |
| `-1002` | Unauthorized | Token 无效或过期 | 刷新 JWT Token |
| `-1003` | Rate limit exceeded | 请求过于频繁 | 实现限流与指数退避 |
| `-1004` | Endpoint not found | 接口不存在 | 检查接口 URL |
| `-1005` | Invalid content type | Content-Type 错误 | 使用 `application/json` |
| `-1006` | Unexpected response | 服务端返回异常数据 | 重试；持续出现请联系支持 |
| `-1007` | Timeout | 请求超时 | 延长超时并重试 |
| `-1008` | Server busy | 服务暂时繁忙 | 稍后重试 |
| `-1010` | Error message received | 通用错误 | 查看 `msg` 字段细节 |

---

## 请求错误（11xx）

| Code | Message | 说明 | 解决方案 |
|------|---------|-------------|----------|
| `-1100` | Illegal characters | 参数包含非法字符 | 去除异常字符 |
| `-1101` | Too many parameters | 参数数量超限 | 减少参数数量 |
| `-1102` | Mandatory parameter missing | 缺少必填参数 | 补全必填字段 |
| `-1103` | Unknown parameter | 含未知参数 | 移除无效参数 |
| `-1104` | Unread parameters | 参数未被处理 | 检查参数格式 |
| `-1105` | Parameter empty | 参数为空 | 提供有效值 |
| `-1106` | Parameter not required | 提交了不需要的参数 | 移除该参数 |
| `-1111` | Invalid precision | 小数精度过高 | 降低小数位 |
| `-1112` | No open orders | 无该交易对挂单 | 先确认是否存在挂单 |
| `-1114` | Invalid time in force | timeInForce 非法 | 使用 GTC、IOC、FOK 或 GTX |
| `-1115` | Invalid order type | 订单类型非法 | 使用 MARKET、LIMIT、STOP 等 |
| `-1116` | Invalid side | 买卖方向非法 | 使用 BUY 或 SELL |
| `-1117` | Empty new client order id | newClientOrderId 为空 | 传入有效 client order ID |
| `-1118` | Empty original client order id | origClientOrderId 为空 | 传入有效原始订单 ID |
| `-1119` | Invalid interval | K 线周期非法 | 使用有效周期（1m、5m、1h 等） |
| `-1120` | Invalid symbol | 交易对不存在 | 用 exchangeinfo 校验交易对 |
| `-1121` | Invalid symbol status | 交易对状态不可交易 | 可能处于维护或暂停 |
| `-1125` | Invalid listen key | WebSocket listen key 无效 | 重新生成 listen key |
| `-1127` | Lookup interval too large | 时间范围超限 | 缩小查询区间 |
| `-1128` | Invalid combination | 参数组合非法 | 按接口要求重新组合参数 |
| `-1130` | Invalid data | 数据格式错误 | 校验请求数据结构 |

---

## 签名错误（12xx）

| Code | Message | 说明 | 解决方案 |
|------|---------|-------------|----------|
| `-1021` | Timestamp outside recv window | 请求时间戳超出窗口 | 同步系统时间 |
| `-1022` | Invalid signature | 签名校验失败 | 检查签名逻辑 |

### 签名错误排查

1. **校验时间戳**：需在服务端时间 5000ms 窗口内
   ```bash
   curl http://119.8.50.236:8088/api/gateway/time
   ```

2. **确认签名算法**：使用 HMAC-SHA256

3. **确认参数顺序**：参数需按字母顺序排序

4. **确认编码方式**：所有参数值应 URL 编码

---

## 订单错误（20xx）

| Code | Message | 说明 | 解决方案 |
|------|---------|-------------|----------|
| `-2010` | Insufficient balance | 保证金不足 | 追加资金或降低下单量 |
| `-2011` | Order not found | 订单不存在 | 校验订单 ID |
| `-2012` | Order cancelled | 订单已撤销 | 无需处理 |
| `-2013` | Order filled | 订单已成交 | 无需处理 |
| `-2014` | Invalid API key format | API Key 格式错误 | 检查 API Key |
| `-2015` | Invalid order side | side 参数非法 | 使用 BUY 或 SELL |
| `-2016` | No trading window | 当前不可交易 | 市场可能关闭 |
| `-2017` | Order archived | 订单已归档 | 查询历史订单接口 |
| `-2018` | Invalid quantity | 数量超出限制 | 检查最小/最大下单量 |
| `-2019` | Invalid price | 价格超出限制 | 检查价格限制 |
| `-2020` | Invalid stop price | 止损/触发价格非法 | 检查触发价逻辑 |
| `-2021` | Order would trigger immediately | 条件单会立即触发 | 调整触发价 |
| `-2022` | Quantity too low | 数量低于下限 | 提高下单数量 |
| `-2023` | Reduce only rejected | reduceOnly 被拒绝 | 检查是否存在可减仓位 |
| `-2024` | Position side mismatch | 仓位方向不匹配 | 检查双向持仓设置 |
| `-2025` | Position side not match | 仓位方向错误 | 使用正确 positionSide |
| `-2026` | Insufficient position | 平仓数量超过当前仓位 | 降低平仓数量 |
| `-2027` | Order being processed | 订单处理中 | 稍后查询状态 |
| `-2028` | Order cancel rejected | 撤单失败 | 订单可能已成交/已撤销 |

---

## 仓位错误（21xx）

| Code | Message | 说明 | 解决方案 |
|------|---------|-------------|----------|
| `-2100` | Position mode already set | 仓位模式已设置 | 无需变更 |
| `-2101` | Position mode change failed | 无法切换仓位模式 | 先平掉全部仓位 |
| `-2102` | Invalid position side | 仓位方向非法 | 使用 LONG、SHORT 或 BOTH |
| `-2103` | Position not found | 仓位不存在 | 检查交易对与仓位方向 |
| `-2104` | Leverage too high | 杠杆过高 | 降低杠杆 |
| `-2105` | Leverage too low | 杠杆过低 | 提高杠杆 |

---

## 保证金错误（22xx）

| Code | Message | 说明 | 解决方案 |
|------|---------|-------------|----------|
| `-2200` | Margin type already set | 保证金类型已设置 | 无需变更 |
| `-2201` | Cannot change margin type | 无法切换保证金类型 | 先平掉相关仓位 |
| `-2202` | Insufficient margin | 保证金不足 | 追加保证金 |
| `-2203` | Cannot add margin | 无法追加保证金 | 需先有仓位 |
| `-2204` | Cannot remove margin | 无法减少保证金 | 减少会触发强平风险 |

---

## WebSocket 错误（30xx）

| Code | Message | 说明 | 解决方案 |
|------|---------|-------------|----------|
| `-3000` | WebSocket error | 通用 WebSocket 错误 | 重连 |
| `-3001` | Invalid message | 消息格式错误 | 检查消息结构 |
| `-3002` | Invalid method | 方法非法 | 使用有效方法（SUBSCRIBE 等） |
| `-3003` | Invalid params | 参数非法 | 校验参数格式 |
| `-3004` | Too many subscriptions | 订阅数超限 | 减少订阅 |
| `-3005` | Listen key expired | 用户流 listen key 过期 | 重新生成 listen key |
| `-3006` | Connection limit | 连接数超限 | 关闭闲置连接 |

---

## HTTP 状态码

除 API 业务错误码外，HTTP 状态码也代表请求结果：

| Status | 含义 | 说明 |
|--------|---------|-------------|
| `200` | OK | 请求成功 |
| `400` | Bad Request | 请求参数不合法 |
| `401` | Unauthorized | 鉴权失败 |
| `403` | Forbidden | 无权限执行该操作 |
| `404` | Not Found | 接口不存在 |
| `429` | Too Many Requests | 触发限流 |
| `500` | Internal Server Error | 服务器内部错误 |
| `502` | Bad Gateway | 上游服务错误 |
| `503` | Service Unavailable | 服务暂不可用 |
| `504` | Gateway Timeout | 网关超时 |

---

## 最佳实践

### 错误处理

```python
import requests

def api_request(endpoint, params=None):
    response = requests.get(f"http://119.8.50.236:8088{endpoint}", params=params)
    data = response.json()

    if data.get("code") != 0:
        error_code = data.get("code")
        error_msg = data.get("msg")

        if error_code == -1003:
            # 触发限流，执行退避后重试
            time.sleep(60)
            return api_request(endpoint, params)
        elif error_code == -1002:
            # Token 过期，刷新后重试
            refresh_token()
            return api_request(endpoint, params)
        else:
            raise Exception(f"API Error {error_code}: {error_msg}")

    return data["data"]
```

### 重试策略

对瞬时错误（`-1001`、`-1007`、`-1008`）建议使用指数退避：

```python
import time

def retry_with_backoff(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = (2 ** attempt) + random.random()
            time.sleep(wait_time)
```
