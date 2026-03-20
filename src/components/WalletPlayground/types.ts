/* eslint-disable @typescript-eslint/no-explicit-any */
export interface WalletInfo {
  address: string
  privateKey: string
}

export interface BalanceInfo {
  trx: string
  usdt: string
  loading: boolean
  error: string | null
}

export interface TransactionRecord {
  txId: string
  type: 'TRX' | 'USDT'
  from: string
  to: string
  amount: string
  timestamp: number
}

export interface SendResult {
  success: boolean
  txId?: string
  error?: string
}

declare global {
  interface Window {
    TronWeb: any
    Buffer: any
  }
}
