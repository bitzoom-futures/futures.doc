import { useCallback, useEffect, useState } from 'react'
import { LOCALSTORAGE_KEY } from '../constants'
import type { WalletInfo } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWallet(tronWeb: any) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY)
      if (saved) {
        setWallet(JSON.parse(saved))
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const persist = (w: WalletInfo | null) => {
    setWallet(w)
    if (w) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(w))
    } else {
      localStorage.removeItem(LOCALSTORAGE_KEY)
    }
  }

  const createWallet = useCallback(async () => {
    if (!tronWeb) return
    setLoading(true)
    try {
      const acc = await tronWeb.createAccount()
      persist({ address: acc.address.base58, privateKey: acc.privateKey })
    } finally {
      setLoading(false)
    }
  }, [tronWeb])

  const importWallet = useCallback(
    (privateKey: string) => {
      if (!tronWeb) return
      try {
        const address = tronWeb.address.fromPrivateKey(privateKey)
        if (!address) throw new Error('Invalid private key')
        persist({ address, privateKey })
      } catch {
        throw new Error('Invalid private key')
      }
    },
    [tronWeb]
  )

  const clearWallet = useCallback(() => {
    persist(null)
  }, [])

  return { wallet, createWallet, importWallet, clearWallet, loading }
}
