import { useCallback, useState } from 'react'
import { NILE_URL, USDT_CONTRACT } from '../constants'
import type { BalanceInfo } from '../types'

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function toHex(tronAddr: string): string {
  let num = BigInt(0)
  for (const c of tronAddr) {
    num = num * 58n + BigInt(ALPHABET.indexOf(c))
  }
  let hex = num.toString(16)
  while (hex.length < 50) hex = '0' + hex
  return hex.slice(0, 42)
}

const initial: BalanceInfo = { trx: '', usdt: '', loading: false, error: null }

export function useBalances() {
  const [balance, setBalance] = useState<BalanceInfo>(initial)

  const checkBalance = useCallback(async (address: string) => {
    if (!address) return
    setBalance({ trx: '', usdt: '', loading: true, error: null })

    try {
      const [trxRes, usdtRes] = await Promise.all([
        fetch(`${NILE_URL}/wallet/getaccount`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, visible: true })
        }),
        fetch(`${NILE_URL}/wallet/triggersmartcontract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contract_address: USDT_CONTRACT,
            function_selector: 'balanceOf(address)',
            parameter: '0000000000000000000000' + toHex(address),
            owner_address: address,
            visible: true
          })
        })
      ])

      const trxJson = await trxRes.json()
      const usdtJson = await usdtRes.json()

      const sun = trxJson.balance || 0
      const trx = (sun / 1_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

      let usdt = '0.00'
      if (usdtJson?.constant_result?.[0]) {
        const raw = BigInt('0x' + usdtJson.constant_result[0])
        usdt = (Number(raw) / 1_000_000).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }

      setBalance({ trx: trx + ' TRX', usdt: usdt + ' USDT', loading: false, error: null })
    } catch {
      setBalance({ trx: '', usdt: '', loading: false, error: 'Failed to fetch balances' })
    }
  }, [])

  return { balance, checkBalance }
}
