import { useCallback, useState } from 'react'
import { NILE_URL, USDT_CONTRACT, FUNDED_ADDR, FUNDED_PRIV } from '../constants'
import type { SendResult } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSenderTronWeb(): any {
  return new window.TronWeb({ fullHost: NILE_URL, privateKey: FUNDED_PRIV })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createUserTronWeb(privateKey: string): any {
  return new window.TronWeb({ fullHost: NILE_URL, privateKey })
}

export function useTransactions() {
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<SendResult | null>(null)
  const [recycling, setRecycling] = useState(false)
  const [recycleResult, setRecycleResult] = useState<SendResult | null>(null)

  const sendTRX = useCallback(async (toAddress: string, amountTRX: number) => {
    setSending(true)
    setLastResult(null)
    try {
      const tw = createSenderTronWeb()
      const amountSun = Math.floor(amountTRX * 1e6)
      const tx = await tw.transactionBuilder.sendTrx(toAddress, amountSun, FUNDED_ADDR)
      const signedTx = await tw.trx.sign(tx)
      const receipt = await tw.trx.sendRawTransaction(signedTx)
      const result: SendResult = { success: true, txId: receipt.txid }
      setLastResult(result)
      return result
    } catch (e: unknown) {
      const result: SendResult = { success: false, error: (e as Error).message }
      setLastResult(result)
      return result
    } finally {
      setSending(false)
    }
  }, [])

  const sendUSDT = useCallback(async (toAddress: string, amountUSDT: number) => {
    setSending(true)
    setLastResult(null)
    try {
      const tw = createSenderTronWeb()
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
      const result: SendResult = { success: true, txId: receipt.txid }
      setLastResult(result)
      return result
    } catch (e: unknown) {
      const result: SendResult = { success: false, error: (e as Error).message }
      setLastResult(result)
      return result
    } finally {
      setSending(false)
    }
  }, [])

  // Recycle: send USDT first (needs TRX for gas), then send remaining TRX back
  const recycleToFaucet = useCallback(
    async (userAddress: string, userPrivateKey: string, trxBalance: number, usdtBalance: number) => {
      setRecycling(true)
      setRecycleResult(null)
      try {
        const tw = createUserTronWeb(userPrivateKey)

        // Step 1: Send all USDT back first (requires TRX for gas)
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
          // Wait a moment for the USDT tx to settle before sending TRX
          await new Promise((r) => setTimeout(r, 3000))
        }

        // Step 2: Send remaining TRX back (keep 1 TRX for potential fees)
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

  return { sendTRX, sendUSDT, sending, lastResult, recycleToFaucet, recycling, recycleResult }
}
