import { useCallback, useState } from 'react'
import { NILE_URL, USDT_CONTRACT } from '../constants'
import type { TransactionRecord } from '../types'

export function useTransactionHistory() {
  const [history, setHistory] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async (address: string) => {
    if (!address) return
    setLoading(true)
    setError(null)

    try {
      const [trxRes, trc20Res] = await Promise.all([
        fetch(`${NILE_URL}/v1/accounts/${address}/transactions?limit=20`),
        fetch(
          `${NILE_URL}/v1/accounts/${address}/transactions/trc20?limit=20&contract_address=${USDT_CONTRACT}`
        )
      ])

      const trxJson = await trxRes.json()
      const trc20Json = await trc20Res.json()

      const records: TransactionRecord[] = []

      // Parse TRX transactions
      if (trxJson.data) {
        for (const tx of trxJson.data) {
          const contract = tx.raw_data?.contract?.[0]
          if (!contract || contract.type !== 'TransferContract') continue
          const val = contract.parameter?.value
          if (!val) continue
          records.push({
            txId: tx.txID,
            type: 'TRX',
            from: val.owner_address,
            to: val.to_address,
            amount: (val.amount / 1_000_000).toFixed(2) + ' TRX',
            timestamp: tx.raw_data.timestamp || tx.block_timestamp
          })
        }
      }

      // Parse TRC-20 (USDT) transactions
      if (trc20Json.data) {
        for (const tx of trc20Json.data) {
          records.push({
            txId: tx.transaction_id,
            type: 'USDT',
            from: tx.from,
            to: tx.to,
            amount: (Number(tx.value) / 1_000_000).toFixed(2) + ' USDT',
            timestamp: tx.block_timestamp
          })
        }
      }

      records.sort((a, b) => b.timestamp - a.timestamp)
      setHistory(records)
    } catch {
      setError('Failed to fetch transaction history')
    } finally {
      setLoading(false)
    }
  }, [])

  return { history, loading, error, fetchHistory }
}
