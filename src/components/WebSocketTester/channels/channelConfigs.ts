import type { ChannelConfig } from '../types'

export const channels: ChannelConfig[] = [
  {
    id: 'ticker',
    label: '/api/v1/ticker',
    path: '/api/v1/ticker',
    requiresAuth: false,
    description: 'Real-time ticker data for a symbol.',
    params: [{ name: 'symbol', label: 'Symbol', type: 'string', required: true, placeholder: 'BTCUSDT' }]
  },
  {
    id: 'ticker-price',
    label: '/api/v1/ticker/price',
    path: '/api/v1/ticker/price',
    requiresAuth: false,
    description: 'Last traded price updates.',
    params: [{ name: 'symbol', label: 'Symbol', type: 'string', required: true, placeholder: 'BTCUSDT' }]
  },
  {
    id: 'premiumindex',
    label: '/api/v1/premiumindex',
    path: '/api/v1/premiumindex',
    requiresAuth: false,
    description: 'Premium index data for a symbol.',
    params: [{ name: 'symbol', label: 'Symbol', type: 'string', required: true, placeholder: 'BTCUSDT' }]
  },
  {
    id: 'ticker-hr24',
    label: '/api/v1/ticker/hr24',
    path: '/api/v1/ticker/hr24',
    requiresAuth: false,
    description: '24-hour ticker statistics.',
    params: [{ name: 'symbol', label: 'Symbol', type: 'string', required: false, placeholder: 'BTCUSDT' }]
  },
  {
    id: 'depth',
    label: '/api/v1/depth',
    path: '/api/v1/depth',
    requiresAuth: false,
    description: 'Order book depth snapshots.',
    params: [
      { name: 'symbol', label: 'Symbol', type: 'string', required: true, placeholder: 'BTCUSDT' },
      {
        name: 'limit',
        label: 'Limit',
        type: 'select',
        required: true,
        defaultValue: '20',
        options: [
          { label: '5', value: '5' },
          { label: '10', value: '10' },
          { label: '20', value: '20' }
        ]
      }
    ]
  },
  {
    id: 'klines',
    label: '/api/v1/klines',
    path: '/api/v1/klines',
    requiresAuth: false,
    description: 'Kline/candlestick data.',
    params: [
      { name: 'symbol', label: 'Symbol', type: 'string', required: true, placeholder: 'BTCUSDT' },
      {
        name: 'interval',
        label: 'Interval',
        type: 'select',
        required: true,
        defaultValue: '1m',
        options: [
          '1m',
          '3m',
          '5m',
          '15m',
          '30m',
          '1h',
          '2h',
          '4h',
          '6h',
          '8h',
          '12h',
          '1d',
          '3d',
          '1w',
          '1M'
        ].map((v) => ({ label: v, value: v }))
      },
      { name: 'limit', label: 'Limit', type: 'number', required: false, placeholder: '100' }
    ]
  },
  {
    id: 'trades',
    label: '/api/v1/trades',
    path: '/api/v1/trades',
    requiresAuth: false,
    description: 'Recent trades.',
    params: [
      { name: 'symbol', label: 'Symbol', type: 'string', required: true, placeholder: 'BTCUSDT' },
      { name: 'limit', label: 'Limit', type: 'number', required: false, placeholder: '100' }
    ]
  },
  {
    id: 'leverage',
    label: '/api/v1/leverage',
    path: '/api/v1/leverage',
    requiresAuth: false,
    description: 'Leverage information.',
    params: [{ name: 'symbol', label: 'Symbol', type: 'string', required: false, placeholder: 'BTCUSDT' }]
  },
  {
    id: 'margintype',
    label: '/api/v1/margintype',
    path: '/api/v1/margintype',
    requiresAuth: false,
    description: 'Margin type data.',
    params: [{ name: 'symbol', label: 'Symbol', type: 'string', required: true, placeholder: 'BTCUSDT' }]
  },
  {
    id: 'exchangeinfo',
    label: '/api/v1/exchangeinfo',
    path: '/api/v1/exchangeinfo',
    requiresAuth: false,
    description: 'Exchange metadata.',
    params: []
  },
  {
    id: 'adlquantile',
    label: '/api/v1/adlquantile',
    path: '/api/v1/adlquantile',
    requiresAuth: false,
    description: 'ADL quantile data.',
    params: [{ name: 'symbol', label: 'Symbol', type: 'string', required: false, placeholder: 'BTCUSDT' }]
  },
  {
    id: 'balance',
    label: '/api/v1/balance',
    path: '/api/v1/balance',
    requiresAuth: true,
    description: 'Account balances.',
    params: []
  },
  {
    id: 'openorders',
    label: '/api/v1/openorders',
    path: '/api/v1/openorders',
    requiresAuth: true,
    description: 'Open orders for all symbols or one symbol.',
    params: [{ name: 'symbol', label: 'Symbol', type: 'string', required: false, placeholder: 'BTCUSDT' }]
  },
  {
    id: 'positionrisk',
    label: '/api/v1/positionrisk',
    path: '/api/v1/positionrisk',
    requiresAuth: true,
    description: 'Position risk information.',
    params: [{ name: 'symbol', label: 'Symbol', type: 'string', required: false, placeholder: 'BTCUSDT' }]
  }
]

export function getChannel(id: string): ChannelConfig {
  const channel = channels.find((item) => item.id === id)
  if (!channel) {
    throw new Error(`Unknown channel id: ${id}`)
  }
  return channel
}
