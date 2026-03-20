import React from 'react'
import { TRONSCAN_TX_URL } from '../constants'
import type { TransactionRecord } from '../types'
import styles from '../styles/WalletPlayground.module.css'

interface Props {
  history: TransactionRecord[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  hasAddress: boolean
}

function shortenAddr(addr: string): string {
  if (!addr || addr.length < 12) return addr
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString()
}

export default function TransactionHistory({
  history,
  loading,
  error,
  onRefresh,
  hasAddress
}: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Transaction History</h3>
        <button
          className={styles.buttonSmall}
          onClick={onRefresh}
          disabled={loading || !hasAddress}
        >
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      {!hasAddress && (
        <p className={styles.helperText}>Create or import a wallet to view transaction history.</p>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {history.length === 0 && hasAddress && !loading && !error && (
        <p className={styles.helperText}>No transactions found. Click Refresh to load.</p>
      )}

      {history.length > 0 && (
        <div className={history.length > 5 ? styles.historyListScroll : styles.historyList}>
          {history.map((tx) => (
            <div key={tx.txId} className={styles.historyItem}>
              <div className={styles.historyRow}>
                <span className={tx.type === 'TRX' ? styles.badgeTRX : styles.badgeUSDT}>
                  {tx.type}
                </span>
                <span className={styles.historyAmount}>{tx.amount}</span>
                <span className={styles.historyTime}>{formatTime(tx.timestamp)}</span>
              </div>
              <div className={styles.historyDetail}>
                {shortenAddr(tx.from)} → {shortenAddr(tx.to)}
                {' | '}
                <a
                  href={TRONSCAN_TX_URL + tx.txId}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tx.txId.slice(0, 12)}...
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
