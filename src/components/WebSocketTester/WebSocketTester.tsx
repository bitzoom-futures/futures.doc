import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import type { ChannelConfig, ParameterDefinition, ParameterValue, WsResponse } from './types'
import ConnectionPanel from './components/ConnectionPanel'
import ParameterForm from './components/ParameterForm'
import MessageLog from './components/MessageLog'
import styles from './styles/WebSocketTester.module.css'
import { canUseInteractiveWebSocket } from './browserGuards'
import { normalizeSubscriptionKey, useWebSocket } from './hooks/useWebSocket'
import { useMessageLog } from './hooks/useMessageLog'

export interface WebSocketTesterProps {
  channel: ChannelConfig
  defaultServerUrl?: string
  maxMessages?: number
}

function buildData(
  channel: ChannelConfig,
  values: Record<string, string>
): { data: Record<string, unknown>; errors: string[] } {
  const errors: string[] = []
  const data: Record<string, unknown> = {}

  channel.params.forEach((param) => {
    const value = String(values[param.name] ?? param.defaultValue ?? '').trim()
    if (param.required && !value) {
      errors.push(`${param.label} is required`)
      return
    }
    if (!value) return
    const parsedValue = parseParameterValue(param, value)

    if (param.type === 'number') {
      const numericValue = Number(parsedValue)

      if (Number.isNaN(numericValue)) {
        errors.push(`${param.label} must be a number`)
        return
      }
      if (param.min !== undefined && numericValue < param.min) {
        errors.push(`${param.label} must be at least ${param.min}`)
        return
      }
      if (param.max !== undefined && numericValue > param.max) {
        errors.push(`${param.label} must be at most ${param.max}`)
        return
      }
    }

    data[param.name] = parsedValue
  })

  return { data, errors }
}

function parseParameterValue(param: ParameterDefinition, value: string): ParameterValue {
  if (param.type === 'number') {
    return Number(value)
  }

  if (param.type === 'select') {
    const matchedOption = param.options?.find((option) => String(option.value) === value)
    if (matchedOption) {
      return matchedOption.value
    }
  }

  return value
}

function InteractiveWebSocketTester({
  channel,
  defaultServerUrl,
  maxMessages = 200
}: WebSocketTesterProps) {
  const { siteConfig } = useDocusaurusContext()
  const generatedServerUrl =
    (siteConfig.customFields && (siteConfig.customFields as Record<string, unknown>).hmacApiUrl) || ''
  const initialServerUrl =
    defaultServerUrl || (typeof generatedServerUrl === 'string' ? generatedServerUrl : 'https://api1.riverwa.com')
  const [serverUrl, setServerUrl] = useState(initialServerUrl)
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [lastError, setLastError] = useState<string>('')
  const [pendingSubKey, setPendingSubKey] = useState<string | null>(null)
  const [subIdByKey, setSubIdByKey] = useState<Record<string, string>>({})

  const { messages, addMessage, clearMessages } = useMessageLog(maxMessages)

  const handleIncomingMessage = useCallback(
    (message: WsResponse) => {
      addMessage({ direction: 'in', kind: message.event, payload: message })

      if (message.event === 'error') {
        setLastError(`Server error on ${message.channel}`)
        return
      }

      if (message.event === 'sub' && pendingSubKey) {
        const data = message.data
        if (data && typeof data === 'object') {
          const ids = Object.keys(data as Record<string, unknown>)
          if (ids.length > 0) {
            setSubIdByKey((prev) => ({ ...prev, [pendingSubKey]: ids[0] }))
          }
        }
        setPendingSubKey(null)
      }

      if (message.event === 'unsub') {
        const unsubSubId = typeof message.data === 'string' ? message.data : ''
        if (unsubSubId) {
          setSubIdByKey((prev) => {
            const next = { ...prev }
            Object.entries(next).forEach(([key, value]) => {
              if (value === unsubSubId) {
                delete next[key]
              }
            })
            return next
          })
        }
      }
    },
    [addMessage, pendingSubKey]
  )

  const { status, wsUrl, connect, disconnect, send, isConnected } = useWebSocket({
    serverUrl,
    onMessage: handleIncomingMessage,
    onSystemMessage: (message) => addMessage({ direction: 'system', kind: 'system', payload: message })
  })

  useEffect(() => {
    setParamValues({})
    setSubIdByKey({})
    setPendingSubKey(null)
    setLastError('')
  }, [channel.id])

  useEffect(() => {
    if (status !== 'connected') {
      setSubIdByKey({})
      setPendingSubKey(null)
    }
  }, [status])

  const currentData = useMemo(() => buildData(channel, paramValues), [channel, paramValues])
  const subscriptionKey = useMemo(
    () => normalizeSubscriptionKey(channel.path, currentData.data),
    [channel.path, currentData.data]
  )

  const handleParamChange = (name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubscribe = () => {
    setLastError('')

    if (currentData.errors.length > 0) {
      setLastError(currentData.errors.join(', '))
      return
    }

    try {
      const payload = {
        channel: channel.path,
        event: 'sub' as const,
        data: currentData.data
      }
      send(payload)
      setPendingSubKey(subscriptionKey)
      addMessage({ direction: 'out', kind: 'sub', payload })
    } catch (error) {
      setLastError((error as Error).message)
    }
  }

  const handleUnsubscribe = () => {
    setLastError('')
    try {
      const payload = {
        channel: channel.path,
        event: 'unsub' as const,
        data: currentData.data
      }
      send(payload)
      addMessage({ direction: 'out', kind: 'unsub', payload })
    } catch (error) {
      setLastError((error as Error).message)
    }
  }

  return (
    <div className={styles.wrapper}>
      <ConnectionPanel
        serverUrl={serverUrl}
        onServerUrlChange={setServerUrl}
        status={status}
        resolvedUrl={wsUrl}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <div className={styles.panel}>
        <h3>{channel.path}</h3>
        <p className={styles.helperText}>{channel.description}</p>
        <div className={styles.row}>
          <button className={styles.buttonPrimary} onClick={handleSubscribe} disabled={!isConnected}>
            Subscribe
          </button>
          <button className={styles.button} onClick={handleUnsubscribe} disabled={!isConnected}>
            Unsubscribe
          </button>
          <span className={styles.helperText}>SubId: {subIdByKey[subscriptionKey] ?? 'not assigned'}</span>
        </div>
      </div>

      <ParameterForm params={channel.params} values={paramValues} onChange={handleParamChange} />

      {lastError ? <div className={styles.error}>{lastError}</div> : null}

      <MessageLog messages={messages} onClear={clearMessages} />
    </div>
  )
}

export default function WebSocketTester(props: WebSocketTesterProps) {
  if (!canUseInteractiveWebSocket(props.channel)) {
    return (
      <div className={styles.privateGuard} role="note">
        <span className={styles.privateGuardMark} aria-hidden="true">◆</span>
        <div>
          <p className={styles.privateGuardEyebrow}>Private channel</p>
          <h3>{props.channel.path}</h3>
          <p>{props.channel.description}</p>
          <p>
            Private WebSocket authentication uses an HMAC-signed <code>logon</code> message. To keep
            your API secret out of the browser, authentication and subscription controls are disabled here.
          </p>
          <Link to="/guides/api-key-authentication">Open the HMAC signing guide →</Link>
        </div>
      </div>
    )
  }

  return <InteractiveWebSocketTester {...props} />
}
