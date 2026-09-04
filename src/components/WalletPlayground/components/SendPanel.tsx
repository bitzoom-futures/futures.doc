import React, { useState } from 'react'
import { TRONSCAN_TX_URL } from '../constants'
import type { SendResult } from '../types'
import styles from '../styles/WalletPlayground.module.css'

interface Props {
  onSendTRX: (toAddress: string, amount: number) => Promise<SendResult>
  onSendUSDT: (toAddress: string, amount: number) => Promise<SendResult>
  sending: boolean
  sendResult: SendResult | null
  hasWallet: boolean
}

export default function SendPanel({
  onSendTRX,
  onSendUSDT,
  sending,
  sendResult,
  hasWallet
}: Props) {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState<'TRX' | 'USDT'>('USDT')

  const handleSend = () => {
    const num = parseFloat(amount)
    if (!toAddress.trim() || isNaN(num) || num <= 0) return
    if (token === 'TRX') {
      onSendTRX(toAddress.trim(), num)
    } else {
      onSendUSDT(toAddress.trim(), num)
    }
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>Send Tokens</h3>
      <p className={styles.helperText}>
        Send TRX or USDT from your wallet to any TRON address.
      </p>

      {!hasWallet ? (
        <p className={styles.helperText}>Create or import a wallet first.</p>
      ) : (
        <>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>To Address</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Recipient TRON address (T...)"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup} style={{ flex: 1 }}>
              <label className={styles.fieldLabel}>Amount</label>
              <input
                className={styles.input}
                type="number"
                placeholder="0.00"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Token</label>
              <div className={styles.row}>
                <button
                  className={token === 'USDT' ? styles.buttonPrimary : styles.button}
                  onClick={() => setToken('USDT')}
                >
                  USDT
                </button>
                <button
                  className={token === 'TRX' ? styles.buttonPrimary : styles.button}
                  onClick={() => setToken('TRX')}
                >
                  TRX
                </button>
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <button
              className={styles.buttonPrimary}
              onClick={handleSend}
              disabled={sending || !toAddress.trim() || !amount || parseFloat(amount) <= 0}
            >
              {sending ? 'Sending...' : `Send ${token}`}
            </button>
          </div>

          {sendResult && (
            <div className={sendResult.success && sendResult.status !== 'failed' ? styles.success : styles.error}>
              {sendResult.success ? (
                <>
                  Transaction {sendResult.status === 'confirmed' ? 'confirmed' : sendResult.status === 'failed' ? 'failed' : 'sent (pending...)'}
                  {' '}
                  <a
                    href={TRONSCAN_TX_URL + sendResult.txId}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on TronScan
                  </a>
                </>
              ) : (
                <>Error: {sendResult.error}</>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
