import { useCallback, useEffect, useRef, useState } from 'react'
import { NILE_URL, USDT_CONTRACT, FUNDED_ADDR, FUNDED_PRIV } from '../constants'
import type { SendResult } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createTronWeb(privateKey: string): any {
  return new window.TronWeb({ fullHost: NILE_URL, privateKey })
}

async function pollTxStatus(txId: string): Promise<'confirmed' | 'failed'> {
  const maxAttempts = 20
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    try {
      const res = await fetch(`${NILE_URL}/wallet/gettransactioninfobyid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: txId })
      })
      const info = await res.json()
      if (info && info.id) {
        // receipt.result: SUCCESS or FAILED
        if (info.receipt?.result === 'SUCCESS' || (!info.receipt?.result && info.blockNumber)) {
          return 'confirmed'
        }
        if (info.receipt?.result === 'FAILED' || info.result === 'FAILED') {
          return 'failed'
        }
      }
    } catch {
      // keep polling
    }
  }
  return 'failed'
}

export function useTransactions() {
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<SendResult | null>(null)
  const [recycling, setRecycling] = useState(false)
  const [recycleResult, setRecycleResult] = useState<SendResult | null>(null)
  const [userSending, setUserSending] = useState(false)
  const [userSendResult, setUserSendResult] = useState<SendResult | null>(null)
  const pollRef = useRef<boolean>(false)

  // Poll tx status when we get a successful send
  const pollAndUpdate = useCallback(
    (txId: string, setter: React.Dispatch<React.SetStateAction<SendResult | null>>) => {
      pollRef.current = true
      pollTxStatus(txId).then((status) => {
        if (pollRef.current) {
          setter((prev) => (prev ? { ...prev, status } : prev))
        }
      })
    },
    []
  )

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      pollRef.current = false
    }
  }, [])

  const sendTRX = useCallback(async (toAddress: string, amountTRX: number) => {
    setSending(true)
    setLastResult(null)
    try {
      const tw = createTronWeb(FUNDED_PRIV)
      const amountSun = Math.floor(amountTRX * 1e6)
      const tx = await tw.transactionBuilder.sendTrx(toAddress, amountSun, FUNDED_ADDR)
      const signedTx = await tw.trx.sign(tx)
      const receipt = await tw.trx.sendRawTransaction(signedTx)
      const result: SendResult = { success: true, txId: receipt.txid, status: 'pending' }
      setLastResult(result)
      pollAndUpdate(receipt.txid, setLastResult)
      return result
    } catch (e: unknown) {
      const result: SendResult = { success: false, error: (e as Error).message }
      setLastResult(result)
      return result
    } finally {
      setSending(false)
    }
  }, [pollAndUpdate])

  const sendUSDT = useCallback(async (toAddress: string, amountUSDT: number) => {
    setSending(true)
    setLastResult(null)
    try {
      const tw = createTronWeb(FUNDED_PRIV)
      const amountSun = Math.floor(amountUSDT * 1e6)
      const { transaction } = await tw.transactionBuilder.triggerSmartContract(
        USDT_CONTRACT,
        'transfer(address,uint256)',
        { feeLimit: 40_000_000 },
        [
          { type: 'address', value: toAddress },
          { type: 'uint256', value: amountSun }
        ],
        FUNDED_ADDR
      )
      const signedTx = await tw.trx.sign(transaction)
      const receipt = await tw.trx.sendRawTransaction(signedTx)
      const result: SendResult = { success: true, txId: receipt.txid, status: 'pending' }
      setLastResult(result)
      pollAndUpdate(receipt.txid, setLastResult)
      return result
    } catch (e: unknown) {
      const result: SendResult = { success: false, error: (e as Error).message }
      setLastResult(result)
      return result
    } finally {
      setSending(false)
    }
  }, [pollAndUpdate])

  // Send TRX from user wallet to any address
  const userSendTRX = useCallback(
    async (fromAddress: string, privateKey: string, toAddress: string, amountTRX: number) => {
      setUserSending(true)
      setUserSendResult(null)
      try {
        const tw = createTronWeb(privateKey)
        const amountSun = Math.floor(amountTRX * 1e6)
        const tx = await tw.transactionBuilder.sendTrx(toAddress, amountSun, fromAddress)
        const signedTx = await tw.trx.sign(tx)
        const receipt = await tw.trx.sendRawTransaction(signedTx)
        const result: SendResult = { success: true, txId: receipt.txid, status: 'pending' }
        setUserSendResult(result)
        pollAndUpdate(receipt.txid, setUserSendResult)
        return result
      } catch (e: unknown) {
        const result: SendResult = { success: false, error: (e as Error).message }
        setUserSendResult(result)
        return result
      } finally {
        setUserSending(false)
      }
    },
    [pollAndUpdate]
  )

  // Send USDT from user wallet to any address
  const userSendUSDT = useCallback(
    async (fromAddress: string, privateKey: string, toAddress: string, amountUSDT: number) => {
      setUserSending(true)
      setUserSendResult(null)
      try {
        const tw = createTronWeb(privateKey)
        const amountSun = Math.floor(amountUSDT * 1e6)
        const { transaction } = await tw.transactionBuilder.triggerSmartContract(
          USDT_CONTRACT,
          'transfer(address,uint256)',
          { feeLimit: 40_000_000 },
          [
            { type: 'address', value: toAddress },
            { type: 'uint256', value: amountSun }
          ],
          fromAddress
        )
        const signedTx = await tw.trx.sign(transaction)
        const receipt = await tw.trx.sendRawTransaction(signedTx)
        const result: SendResult = { success: true, txId: receipt.txid, status: 'pending' }
        setUserSendResult(result)
        pollAndUpdate(receipt.txid, setUserSendResult)
        return result
      } catch (e: unknown) {
        const result: SendResult = { success: false, error: (e as Error).message }
        setUserSendResult(result)
        return result
      } finally {
        setUserSending(false)
      }
    },
    [pollAndUpdate]
  )

  // Recycle: send USDT first (needs TRX for gas), then send remaining TRX back
  const recycleToFaucet = useCallback(
    async (userAddress: string, userPrivateKey: string, trxBalance: number, usdtBalance: number) => {
      setRecycling(true)
      setRecycleResult(null)
      try {
        const tw = createTronWeb(userPrivateKey)

        if (usdtBalance > 0) {
          const usdtSun = Math.floor(usdtBalance * 1e6)
          const { transaction: usdtTx } = await tw.transactionBuilder.triggerSmartContract(
            USDT_CONTRACT,
            'transfer(address,uint256)',
            { feeLimit: 40_000_000 },
            [
              { type: 'address', value: FUNDED_ADDR },
              { type: 'uint256', value: usdtSun }
            ],
            userAddress
          )
          const signedUsdt = await tw.trx.sign(usdtTx)
          await tw.trx.sendRawTransaction(signedUsdt)
          await new Promise((r) => setTimeout(r, 3000))
        }

        if (trxBalance > 1) {
          const sendAmount = Math.floor((trxBalance - 1) * 1e6)
          const trxTx = await tw.transactionBuilder.sendTrx(FUNDED_ADDR, sendAmount, userAddress)
          const signedTrx = await tw.trx.sign(trxTx)
          await tw.trx.sendRawTransaction(signedTrx)
        }

        const result: SendResult = { success: true }
        setRecycleResult(result)
        return result
      } catch (e: unknown) {
        const result: SendResult = { success: false, error: (e as Error).message }
        setRecycleResult(result)
        return result
      } finally {
        setRecycling(false)
      }
    },
    []
  )

  return {
    sendTRX, sendUSDT, sending, lastResult,
    userSendTRX, userSendUSDT, userSending, userSendResult,
    recycleToFaucet, recycling, recycleResult
  }
}
