import React, { useState } from 'react'
import type { BalanceInfo } from '../types'
import styles from '../styles/WalletPlayground.module.css'

interface Props {
  defaultAddress: string
  balance: BalanceInfo
  onCheck: (address: string) => void
}

export default function BalancePanel({ defaultAddress, balance, onCheck }: Props) {
  const [address, setAddress] = useState('')

  const effectiveAddress = address || defaultAddress

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>Balance Checker</h3>
      <p className={styles.helperText}>
        Check the balance of any TRON address on the Nile testnet — not just your own.
      </p>
      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          placeholder={defaultAddress || 'Enter TRON address (T...)'}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCheck(effectiveAddress)}
        />
        <button
          className={styles.buttonPrimary}
          onClick={() => onCheck(effectiveAddress)}
          disabled={!effectiveAddress || balance.loading}
        >
          {balance.loading ? '...' : 'Check'}
        </button>
      </div>

      {(balance.trx || balance.usdt) && (
        <div className={styles.metricsGrid}>
          <div className={styles.metric}>
            <div className={styles.metricLabel}>TRX Balance</div>
            <div className={styles.metricValue}>{balance.trx}</div>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricLabel}>USDT (TRC-20)</div>
            <div className={styles.metricValue}>{balance.usdt}</div>
          </div>
        </div>
      )}

      {balance.error && <div className={styles.error}>{balance.error}</div>}
    </div>
  )
}
