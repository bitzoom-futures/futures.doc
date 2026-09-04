import React, { useState } from 'react'
import CopyButton from './CopyButton'
import type { BalanceInfo, SendResult, WalletInfo } from '../types'
import styles from '../styles/WalletPlayground.module.css'

interface Props {
  wallet: WalletInfo | null
  balance: BalanceInfo
  onCreate: () => Promise<void>
  onImport: (privateKey: string) => void
  onClear: () => void
  onCheckBalance: () => void
  onRecycle: () => void
  loading: boolean
  tronWebReady: boolean
  recycling: boolean
  recycleResult: SendResult | null
}

export default function UserWalletPanel({
  wallet,
  balance,
  onCreate,
  onImport,
  onClear,
  onCheckBalance,
  onRecycle,
  loading,
  tronWebReady,
  recycling,
  recycleResult
}: Props) {
  const [importKey, setImportKey] = useState('')
  const [showPrivKey, setShowPrivKey] = useState(false)
  const [importError, setImportError] = useState('')

  const handleImport = () => {
    setImportError('')
    try {
      onImport(importKey.trim())
      setImportKey('')
    } catch (e: unknown) {
      setImportError((e as Error).message)
    }
  }

  if (wallet) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Your Wallet</h3>
          <div className={styles.headerRight}>
            <button className={styles.button} onClick={onCheckBalance} disabled={balance.loading}>
              {balance.loading ? '...' : 'Check Balance'}
            </button>
            <button
              className={styles.buttonDanger}
              onClick={onRecycle}
              disabled={recycling || (!balance.trx && !balance.usdt)}
              title="Send all tokens back to faucet (USDT first, then TRX)"
            >
              {recycling ? 'Recycling...' : 'Recycle to Faucet'}
            </button>
            <button className={styles.buttonSmall} onClick={onClear}>
              Clear Wallet
            </button>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Address</label>
          <div className={styles.addressRow}>
            <code className={styles.address}>{wallet.address}</code>
            <CopyButton text={wallet.address} />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            Private Key{' '}
            <button
              className={styles.buttonSmall}
              onClick={() => setShowPrivKey(!showPrivKey)}
            >
              {showPrivKey ? 'Hide' : 'Show'}
            </button>
          </label>
          {showPrivKey && (
            <div className={styles.addressRow}>
              <code className={styles.address}>{wallet.privateKey}</code>
              <CopyButton text={wallet.privateKey} />
            </div>
          )}
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

        {recycleResult && (
          <div className={recycleResult.success ? styles.success : styles.error}>
            {recycleResult.success ? (
              'Tokens recycled back to faucet!'
            ) : (
              <>Recycle error: {recycleResult.error}</>
            )}
          </div>
        )}

        <p className={styles.helperText}>Wallet is saved in your browser localStorage.</p>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>Your Wallet</h3>
      <p className={styles.helperText}>Create a new wallet or import an existing one.</p>

      <div className={styles.row}>
        <button
          className={styles.buttonPrimary}
          onClick={onCreate}
          disabled={!tronWebReady || loading}
        >
          {loading ? 'Creating...' : 'Create New Wallet'}
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Import by Private Key</label>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter private key (hex)"
            value={importKey}
            onChange={(e) => setImportKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
          />
          <button
            className={styles.button}
            onClick={handleImport}
            disabled={!tronWebReady || !importKey.trim()}
          >
            Import
          </button>
        </div>
        {importError && <div className={styles.error}>{importError}</div>}
      </div>
    </div>
  )
}
