import React from 'react'
import { FUNDED_ADDR, TRONSCAN_TX_URL } from '../constants'
import type { BalanceInfo, SendResult } from '../types'
import styles from '../styles/WalletPlayground.module.css'

interface Props {
  balance: BalanceInfo
  onCheckBalance: () => void
  onSendTRX: () => void
  onSendUSDT: () => void
  sending: boolean
  lastResult: SendResult | null
  hasUserWallet: boolean
}

export default function HostWalletPanel({
  balance,
  onCheckBalance,
  onSendTRX,
  onSendUSDT,
  sending,
  lastResult,
  hasUserWallet
}: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Host Wallet (Faucet)</h3>
        <span className={styles.netBadge}>Nile Testnet</span>
      </div>
      <p className={styles.helperText}>
        This funded testnet wallet sends test tokens to your wallet. Please use responsibly — faucet funds are limited. Remember to recycle tokens back when you're done testing.
      </p>

      <div className={styles.addressRow}>
        <code className={styles.address}>{FUNDED_ADDR}</code>
        <button
          className={styles.buttonSmall}
          onClick={() => navigator.clipboard.writeText(FUNDED_ADDR)}
          title="Copy address"
        >
          Copy
        </button>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>TRX Balance</div>
          <div className={styles.metricValue}>
            {balance.loading ? '...' : balance.trx || '--'}
          </div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>USDT Balance</div>
          <div className={styles.metricValue}>
            {balance.loading ? '...' : balance.usdt || '--'}
          </div>
        </div>
      </div>

      <div className={styles.rowSpaceBetween}>
        <div className={styles.row}>
          <button
            className={styles.buttonPrimary}
            onClick={onSendTRX}
            disabled={!hasUserWallet || sending}
          >
            Send 100 TRX
          </button>
          <button
            className={styles.buttonPrimary}
            onClick={onSendUSDT}
            disabled={!hasUserWallet || sending}
          >
            Send 100 USDT
          </button>
        </div>
        <button className={styles.button} onClick={onCheckBalance} disabled={balance.loading}>
          {balance.loading ? '...' : 'Check Faucet Balance'}
        </button>
      </div>

      {!hasUserWallet && (
        <p className={styles.helperText}>Create or import a user wallet below to enable sending.</p>
      )}

      {sending && <p className={styles.helperText}>Sending transaction...</p>}

      {lastResult && (
        <div className={lastResult.success ? styles.success : styles.error}>
          {lastResult.success ? (
            <>
              Transaction sent!{' '}
              <a
                href={TRONSCAN_TX_URL + lastResult.txId}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on TronScan
              </a>
            </>
          ) : (
            <>Error: {lastResult.error}</>
          )}
        </div>
      )}

      {balance.error && <div className={styles.error}>{balance.error}</div>}
    </div>
  )
}
