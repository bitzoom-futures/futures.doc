---
sidebar_position: 1
sidebar_label: Web Platform Guide
---

# Bitzoom Web Trading Guide

Your complete guide to futures trading on the Bitzoom web platform.

<a href={require("./WEB_USER_GUIDE.pdf").default} target="_blank">Download PDF</a>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" align="center">
<img src={require("./web-screenshots/01-login.png").default} width="480" />
</td>
<td width="50%" valign="top">

### Sign In

To get started, visit the Bitzoom web platform: **https://test.riverwa.com/**

Click **Sign In** from the top-right corner of the homepage to access the login page.

- Enter your **username, email, or phone** and **password**
- Click **Sign In** to log in
- Sign in with **Google** or click **sign up now** to create an account
- Supports **Password** and **Verification Code** login methods

</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" valign="top">

### Trading Overview

The futures trading page combines all essential tools in a single view:

- **Chart** (left) &mdash; TradingView candlestick chart with technical indicators
- **Order Book** (center) &mdash; Live bid/ask prices and recent trades
- **Order Form** (right) &mdash; Place orders with margin, leverage, and TP/SL controls
- **Positions & Orders** (bottom) &mdash; Monitor open positions and order history
- **Account** (bottom-right) &mdash; View balance and margin details

</td>
<td width="50%" align="center">
<img src={require("./web-screenshots/02-trading-overview.png").default} width="480" />
</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" align="center">
<img src={require("./web-screenshots/03-chart.png").default} width="480" />
</td>
<td width="50%" valign="top">

### Price Chart

The chart area provides detailed price analysis powered by TradingView.

- Switch between timeframes: **1m, 5m, 15m, 1H, 4H, 1D, Weekly**
- View **Last Price**, **24h High/Low**, **Volume**, **Mark Price**, **Index Price** in the top bar
- Add technical indicators: **MA, EMA, BOLL, VOL, MACD, RSI**
- Hover over candles to see **Open, High, Low, Close** and **Change %**

</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" valign="top">

### Chart &mdash; Info Tab

Switch to the **Info** tab to view contract specifications for the trading pair.

- **Max Leverage**, **Funding Rate**, **Index Price**
- **Contract Size**, **Tick Size**, **Min Order Size**
- **Insurance Fund** balance
- **Explorer URL** for on-chain verification

</td>
<td width="50%" align="center">
<img src={require("./web-screenshots/tab-chart-info.png").default} width="480" />
</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" align="center">
<img src={require("./web-screenshots/tab-chart-tradedata.png").default} width="480" />
</td>
<td width="50%" valign="top">

### Chart &mdash; Trade Data Tab

Switch to the **Trade Data** tab to view market analytics.

- **Long/Short Account Ratio** &mdash; Percentage of accounts holding long vs short
- **Long/Short Position Ratio** &mdash; Volume of long vs short positions
- **Buy/Sell Volume** &mdash; Taker buy and sell volume comparison
- **Open Interest** &mdash; Total outstanding contracts over time

</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" valign="top">

### Order Book & Recent Trades

The center panel shows live market depth and recent executions.

- **Order Book** displays bid (green) and ask (red) prices with cumulative quantities
- Toggle between three views: **both sides**, **bids only**, or **asks only**
- The **spread** is shown between bid and ask prices
- **Recent Trades** section below shows the latest executed trades with price, quantity, and timestamp

</td>
<td width="50%" align="center">
<img src={require("./web-screenshots/04-orderbook.png").default} width="480" />
</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" align="center">
<img src={require("./web-screenshots/05-order-form.png").default} width="480" />
</td>
<td width="50%" valign="top">

### Place an Order

The order form is where you configure and submit trades.

1. **Choose Margin Type** &mdash; Select **Cross** or **Isolated** margin
2. **Set Leverage** &mdash; Click the leverage button (e.g., **20x**) to adjust
3. **Select Order Type** &mdash; **Limit**, **Market**, or **Stop Limit**
4. **Enter Price** &mdash; Set your price; click **BBO** for best available
5. **Enter Amount** &mdash; Specify quantity in **ETH** or **USDT**
6. **TP/SL** &mdash; Set Take Profit and Stop Loss levels
7. **Time in Force** &mdash; Choose **GTC**, **FOK**, or **IOC**
8. Click **Buy/Long** (green) or **Sell/Short** (red)

</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" valign="top">

### Positions

The **Positions** tab shows your currently open positions.

- View **Contract**, **Size**, **Entry Price**, **Mark Price**, **Liq. Price**, **Margin**, **PnL**
- Quick actions: **Market Close All**, **Reverse Trade**, **Set TP/SL**
- Toggle **Hide other contracts** to focus on the current trading pair

</td>
<td width="50%" align="center">
<img src={require("./web-screenshots/tab-positions.png").default} width="480" />
</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" align="center">
<img src={require("./web-screenshots/tab-open-orders.png").default} width="480" />
</td>
<td width="50%" valign="top">

### Open Orders

The **Open Orders** tab shows pending orders waiting to be filled.

- View order **Type**, **Side**, **Price**, **Amount**, **Filled**, **Status**
- Cancel individual orders or **Cancel All**
- Filter by current contract or show all pairs

</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" valign="top">

### Order History

The **Order History** tab shows completed and cancelled orders.

- View **filled price**, **filled amount**, **fee**, and **status**
- Filter by **date range**, **symbol**, **direction**, and **order type**
- Export history for record keeping

</td>
<td width="50%" align="center">
<img src={require("./web-screenshots/tab-order-history.png").default} width="480" />
</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" align="center">
<img src={require("./web-screenshots/tab-trade-history.png").default} width="480" />
</td>
<td width="50%" valign="top">

### Trade History

The **Trade History** tab shows all executed fills.

- Each fill shows **price**, **quantity**, **fee**, and **timestamp**
- Partial fills are listed separately
- Filter by **date range** and **symbol**

</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" valign="top">

### Fund Flow

The **Fund Flow** tab tracks all fund movements.

- View **deposits**, **withdrawals**, and **transfers**
- Track **funding fee** charges and receipts
- Filter by **date range** and **transaction type**

</td>
<td width="50%" align="center">
<img src={require("./web-screenshots/tab-fund-flow.png").default} width="480" />
</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" align="center">
<img src={require("./web-screenshots/tab-position-history.png").default} width="480" />
</td>
<td width="50%" valign="top">

### Position History

The **Position History** tab shows all closed positions.

- View **entry price**, **close price**, and **realized PnL**
- Track historical **ROE %** for each position
- Filter by **date range** and **symbol**

</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" valign="top">

### Assets

The **Assets** tab shows your futures account balance at a glance.

- **Wallet Balance** &mdash; Total USDT in futures account
- **Unrealized PnL** &mdash; Current profit/loss on open positions
- **Available Balance** &mdash; Funds available for new orders
- Click **Transfer** to move funds between spot and futures

</td>
<td width="50%" align="center">
<img src={require("./web-screenshots/tab-assets.png").default} width="480" />
</td>
</tr>
</table>
</div>

---

<div className="user-guide-layout">
<table>
<tr>
<td width="50%" align="center">
<img src={require("./web-screenshots/08-account.png").default} width="480" />
</td>
<td width="50%" valign="top">

### Account Overview

The bottom-right panel shows your margin status.

- **Margin Ratio** &mdash; Current margin usage percentage
- **Maintenance Margin** &mdash; Required margin to keep positions open
- **Available Balance** &mdash; Funds available for new orders
- Monitor to avoid **liquidation**

</td>
</tr>
</table>
</div>
