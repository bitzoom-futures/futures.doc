import React, { useCallback, useEffect, useRef } from 'react'
import { FUNDED_ADDR } from './constants'
import { useTronWeb } from './hooks/useTronWeb'
import { useWallet } from './hooks/useWallet'
import { useBalances } from './hooks/useBalances'
import { useTransactions } from './hooks/useTransactions'
import { useTransactionHistory } from './hooks/useTransactionHistory'
import HostWalletPanel from './components/HostWalletPanel'
import UserWalletPanel from './components/UserWalletPanel'
import SendPanel from './components/SendPanel'
import BalancePanel from './components/BalancePanel'
import TransactionHistory from './components/TransactionHistory'
import styles from './styles/WalletPlayground.module.css'

export default function WalletPlayground() {
  const { tronWeb, loading: twLoading, error: twError } = useTronWeb()
  const { wallet, createWallet, importWallet, clearWallet, loading: walletLoading } =
    useWallet(tronWeb)

  const { balance: hostBalance, checkBalance: checkHostBalance } = useBalances()
  const { balance: userBalance, checkBalance: checkUserBalance } = useBalances()
  const { balance: checkerBalance, checkBalance: checkCheckerBalance } = useBalances()
  const {
    sendTRX, sendUSDT, sending, lastResult,
    userSendTRX, userSendUSDT, userSending, userSendResult,
    recycleToFaucet, recycling, recycleResult
  } = useTransactions()
  const { history, loading: histLoading, error: histError, fetchHistory } = useTransactionHistory()

  // Auto-check balances on first load when tronWeb is ready
  const initialLoadDone = useRef(false)
  useEffect(() => {
    if (tronWeb && !initialLoadDone.current) {
      initialLoadDone.current = true
      checkHostBalance(FUNDED_ADDR)
      if (wallet) {
        checkUserBalance(wallet.address)
        fetchHistory(wallet.address)
      }
    }
  }, [tronWeb, wallet, checkHostBalance, checkUserBalance, fetchHistory])

  // Auto-check user balance when wallet changes (create/import)
  const prevWalletAddr = useRef<string | null>(null)
  useEffect(() => {
    if (wallet && wallet.address !== prevWalletAddr.current) {
      prevWalletAddr.current = wallet.address
      checkUserBalance(wallet.address)
      fetchHistory(wallet.address)
    }
    if (!wallet) {
      prevWalletAddr.current = null
    }
  }, [wallet, checkUserBalance, fetchHistory])

  // Auto-refresh balances + history after a send completes
  useEffect(() => {
    if (lastResult?.success) {
      // Wait a few seconds for the tx to propagate
      const timer = setTimeout(() => {
        checkHostBalance(FUNDED_ADDR)
        if (wallet) {
          checkUserBalance(wallet.address)
          fetchHistory(wallet.address)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [lastResult, wallet, checkHostBalance, checkUserBalance, fetchHistory])

  // Auto-refresh after user send completes
  useEffect(() => {
    if (userSendResult?.success) {
      const timer = setTimeout(() => {
        checkHostBalance(FUNDED_ADDR)
        if (wallet) {
          checkUserBalance(wallet.address)
          fetchHistory(wallet.address)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [userSendResult, wallet, checkHostBalance, checkUserBalance, fetchHistory])

  // Auto-refresh after recycle completes
  useEffect(() => {
    if (recycleResult?.success) {
      const timer = setTimeout(() => {
        checkHostBalance(FUNDED_ADDR)
        if (wallet) {
          checkUserBalance(wallet.address)
          fetchHistory(wallet.address)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [recycleResult, wallet, checkHostBalance, checkUserBalance, fetchHistory])

  const handleSendTRX = useCallback(async () => {
    if (wallet) await sendTRX(wallet.address, 100)
  }, [wallet, sendTRX])

  const handleSendUSDT = useCallback(async () => {
    if (wallet) await sendUSDT(wallet.address, 100)
  }, [wallet, sendUSDT])

  const handleUserSendTRX = useCallback(
    async (toAddress: string, amount: number) => {
      if (!wallet) return { success: false, error: 'No wallet' }
      return userSendTRX(wallet.address, wallet.privateKey, toAddress, amount)
    },
    [wallet, userSendTRX]
  )

  const handleUserSendUSDT = useCallback(
    async (toAddress: string, amount: number) => {
      if (!wallet) return { success: false, error: 'No wallet' }
      return userSendUSDT(wallet.address, wallet.privateKey, toAddress, amount)
    },
    [wallet, userSendUSDT]
  )

  const handleRefreshHistory = useCallback(() => {
    if (wallet) fetchHistory(wallet.address)
  }, [wallet, fetchHistory])

  const handleRecycle = useCallback(() => {
    if (!wallet) return
    const trxNum = parseFloat(userBalance.trx) || 0
    const usdtNum = parseFloat(userBalance.usdt) || 0
    recycleToFaucet(wallet.address, wallet.privateKey, trxNum, usdtNum)
  }, [wallet, userBalance, recycleToFaucet])

  const handleClearWallet = useCallback(async () => {
    if (!wallet) return
    // Recycle tokens back to faucet before clearing
    const trxNum = parseFloat(userBalance.trx) || 0
    const usdtNum = parseFloat(userBalance.usdt) || 0
    if (trxNum > 0 || usdtNum > 0) {
      await recycleToFaucet(wallet.address, wallet.privateKey, trxNum, usdtNum)
    }
    clearWallet()
  }, [wallet, userBalance, recycleToFaucet, clearWallet])

  if (twLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.panel}>
          <p className={styles.helperText}>Loading TronWeb...</p>
        </div>
      </div>
    )
  }

  if (twError) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>{twError}</div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <HostWalletPanel
        balance={hostBalance}
        onCheckBalance={() => checkHostBalance(FUNDED_ADDR)}
        onSendTRX={handleSendTRX}
        onSendUSDT={handleSendUSDT}
        sending={sending}
        lastResult={lastResult}
        hasUserWallet={!!wallet}
      />

      <UserWalletPanel
        wallet={wallet}
        balance={userBalance}
        onCreate={createWallet}
        onImport={importWallet}
        onClear={handleClearWallet}
        onCheckBalance={() => wallet && checkUserBalance(wallet.address)}
        onRecycle={handleRecycle}
        loading={walletLoading}
        tronWebReady={!!tronWeb}
        recycling={recycling}
        recycleResult={recycleResult}
      />

      <SendPanel
        onSendTRX={handleUserSendTRX}
        onSendUSDT={handleUserSendUSDT}
        sending={userSending}
        sendResult={userSendResult}
        hasWallet={!!wallet}
      />

      <TransactionHistory
        history={history}
        loading={histLoading}
        error={histError}
        onRefresh={handleRefreshHistory}
        hasAddress={!!wallet}
      />

      <BalancePanel
        defaultAddress={wallet?.address || ''}
        balance={checkerBalance}
        onCheck={checkCheckerBalance}
      />
    </div>
  )
}
