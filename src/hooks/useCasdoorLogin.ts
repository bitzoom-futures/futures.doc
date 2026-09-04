import { useCallback, useEffect, useRef, useState } from 'react'
import CasdoorSdk from 'casdoor-js-sdk'

import { useUser, type UserInfo } from '../context/UserContext'

interface CasdoorConfig {
  Endpoint: string
  ClientID: string
  Organization: string
  Application: string
}

interface UseCasdoorLoginOptions {
  managementGatewayUrl: string
  redirectPath: string
}

const SESSION_STORAGE_KEY = 'user'

function readStoredSession(): UserInfo | null {
  try {
    const value = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!value) return null
    const parsed = JSON.parse(value) as UserInfo
    return parsed?.token?.trim() ? parsed : null
  } catch {
    return null
  }
}

export function useCasdoorLogin({
  managementGatewayUrl,
  redirectPath,
}: UseCasdoorLoginOptions) {
  const { setUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = null
  }, [])

  useEffect(() => {
    const handleCallback = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'casdoor-callback-done') return

      const session = readStoredSession()
      if (session) {
        setUser(session)
        setError('')
      } else {
        setError('Login did not return a valid session. Try again.')
      }
      setLoading(false)
      stopPolling()
    }

    window.addEventListener('message', handleCallback)
    return () => {
      window.removeEventListener('message', handleCallback)
      stopPolling()
    }
  }, [setUser, stopPolling])

  const login = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const apiBase = managementGatewayUrl.replace(/\/+$/, '') || window.location.origin
      const response = await fetch(`${apiBase}/api/casdoor`)
      if (!response.ok) throw new Error('Casdoor configuration request failed')

      const payload = await response.json()
      const config = (payload?.data || payload) as Partial<CasdoorConfig>
      if (!config.Endpoint || !config.ClientID || !config.Organization || !config.Application) {
        throw new Error('Casdoor configuration is incomplete')
      }

      const sdk = new CasdoorSdk({
        serverUrl: config.Endpoint,
        clientId: config.ClientID,
        organizationName: config.Organization,
        appName: config.Application,
        redirectPath,
      })

      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      const popup = window.open(
        sdk.getSigninUrl(),
        'casdoor-login',
        `width=${width},height=${height},left=${left},top=${top},popup=yes`
      )

      if (!popup) {
        setError('Your browser blocked the login window. Allow popups and try again.')
        setLoading(false)
        return
      }

      stopPolling()
      pollRef.current = setInterval(() => {
        try {
          if (popup.closed) {
            stopPolling()
            setLoading(false)
          }
        } catch {
          // The popup is cross-origin until Casdoor redirects it back.
        }
      }, 500)
    } catch {
      setError('Login is temporarily unavailable. Try again.')
      setLoading(false)
      stopPolling()
    }
  }, [managementGatewayUrl, redirectPath, stopPolling])

  return { login, loading, error }
}
