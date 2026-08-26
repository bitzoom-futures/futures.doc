import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ApiKeyRequestError,
  createApiKeyClient,
  type ApiKeyRecord,
  type ApiPermission,
  type CreatedApiKey,
} from '../../api/apiKeys'
import styles from './ApiManagementConsole.module.css'

interface ApiManagementConsoleProps {
  managementGatewayUrl: string
  rawToken: string
  onLogin: () => void
  onSessionExpired: () => void
  loginError?: string
}

function maskAccessKey(apiKey: string) {
  if (apiKey.length <= 12) return apiKey
  return `${apiKey.slice(0, 8)}…${apiKey.slice(-4)}`
}

function formatCreationDate(value?: string) {
  if (!value) return null

  const createdAt = new Date(value)
  if (Number.isNaN(createdAt.getTime())) return null

  return {
    date: new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(createdAt),
    time: new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(createdAt),
  }
}

interface ErrorToast {
  id: number
  message: string
}

export default function ApiManagementConsole({
  managementGatewayUrl,
  rawToken,
  onLogin,
  onSessionExpired,
  loginError = '',
}: ApiManagementConsoleProps) {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([])
  const [loading, setLoading] = useState(Boolean(rawToken))
  const [errorToast, setErrorToast] = useState<ErrorToast | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [permissions, setPermissions] = useState<ApiPermission[]>(['READ'])
  const [ipAllowlist, setIpAllowlist] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingKey, setPendingKey] = useState('')
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null)
  const [secretSaved, setSecretSaved] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRecord | null>(null)
  const [revokeConfirmation, setRevokeConfirmation] = useState('')
  const [copiedField, setCopiedField] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const toastIdRef = useRef(0)
  const client = useMemo(
    () => createApiKeyClient({ baseUrl: managementGatewayUrl, token: rawToken }),
    [managementGatewayUrl, rawToken]
  )

  useEffect(() => {
    if (rawToken) return
    setKeys([])
    setCreatedKey(null)
    setSecretSaved(false)
    setCopiedField('')
    setCreateOpen(false)
    setRevokeTarget(null)
    setRevokeConfirmation('')
  }, [rawToken])

  const activeModal = createdKey ? 'secret' : createOpen ? 'create' : revokeTarget ? 'revoke' : ''

  const showError = useCallback((message: string) => {
    toastIdRef.current += 1
    setErrorToast({ id: toastIdRef.current, message })
  }, [])

  useEffect(() => {
    if (!loginError) return
    showError(loginError)
  }, [loginError, showError])

  useEffect(() => {
    if (!errorToast) return

    const timer = window.setTimeout(() => setErrorToast(null), 5000)
    return () => window.clearTimeout(timer)
  }, [errorToast])

  useEffect(() => {
    if (!activeModal) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activeModal === 'create') setCreateOpen(false)
        if (activeModal === 'revoke') {
          setRevokeTarget(null)
          setRevokeConfirmation('')
        }
        return
      }

      if (event.key !== 'Tab' || !modalRef.current) return
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !modalRef.current.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeModal])

  const handleRequestFailure = useCallback(
    (caught: unknown, fallback: string) => {
      if (
        caught instanceof ApiKeyRequestError &&
        (caught.status === 401 || Number(caught.code) === -1002)
      ) {
        showError('Your session expired. Log in again.')
        onSessionExpired()
        return
      }
      showError(
        caught instanceof ApiKeyRequestError && caught.message ? caught.message : fallback
      )
    },
    [onSessionExpired, showError]
  )

  const loadKeys = useCallback(async () => {
    setLoading(true)
    try {
      setKeys(await client.list())
    } catch (caught) {
      handleRequestFailure(caught, 'Unable to load API keys. Try again.')
    } finally {
      setLoading(false)
    }
  }, [client, handleRequestFailure])

  useEffect(() => {
    if (!rawToken) return
    let active = true

    void (async () => {
      setLoading(true)
      try {
        const nextKeys = await client.list()
        if (active) setKeys(nextKeys)
      } catch (caught) {
        if (active) handleRequestFailure(caught, 'Unable to load API keys. Try again.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [client, handleRequestFailure, rawToken])

  const togglePermission = (permission: ApiPermission) => {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((value) => value !== permission)
        : [...current, permission]
    )
  }

  const copyValue = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(''), 1800)
    } catch {
      setCopiedField('')
      showError('Unable to copy. Select the value and copy it manually.')
    }
  }

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (permissions.length === 0) {
      showError('Select at least one permission.')
      return
    }

    setBusy(true)
    try {
      const nextKey = await client.create({
        label: label.trim(),
        api_permissions: permissions.join(','),
        api_key_ip_whitelist: ipAllowlist
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
          .join(','),
      })
      setCreatedKey(nextKey)
      setSecretSaved(false)
      setCreateOpen(false)
      setLabel('')
      setPermissions(['READ'])
      setIpAllowlist('')
      await loadKeys()
    } catch (caught) {
      handleRequestFailure(caught, 'Unable to create the API key. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleStatusChange = async (key: ApiKeyRecord) => {
    if (key.api_key_status === 'REVOKED') return

    const nextStatus = key.api_key_status === 'ENABLED' ? 'DISABLED' : 'ENABLED'
    setPendingKey(key.api_key)
    try {
      await client.setStatus(key.api_key, nextStatus)
      await loadKeys()
    } catch (caught) {
      handleRequestFailure(
        caught,
        `Unable to ${nextStatus === 'ENABLED' ? 'enable' : 'disable'} this API key.`
      )
    } finally {
      setPendingKey('')
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget || revokeConfirmation !== 'REVOKE') return

    setPendingKey(revokeTarget.api_key)
    try {
      await client.revoke(revokeTarget.api_key)
      setRevokeTarget(null)
      setRevokeConfirmation('')
      await loadKeys()
    } catch (caught) {
      handleRequestFailure(caught, 'Unable to revoke this API key.')
    } finally {
      setPendingKey('')
    }
  }

  const toast = errorToast ? (
    <div className={styles.toastRegion} aria-live="assertive">
      <div className={styles.errorToast} role="alert">
        <span className={styles.toastIcon} aria-hidden="true">!</span>
        <span>{errorToast.message}</span>
        <button
          type="button"
          className={styles.toastDismiss}
          aria-label="Dismiss notification"
          onClick={() => setErrorToast(null)}
        >
          ×
        </button>
      </div>
    </div>
  ) : null

  if (!rawToken) {
    return (
      <>
        <main className={styles.pageShell}>
          <section className={styles.loggedOutCard} aria-labelledby="api-keys-title">
            <span className={styles.securityIcon} aria-hidden="true">BZ</span>
            <p className={styles.eyebrow}>Developer security</p>
            <h1 id="api-keys-title">API keys</h1>
            <p>Log in with your Bitzoom account to create and manage trading credentials.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={onLogin}
            >
              Log in to manage API keys
            </button>
          </section>
        </main>
        {toast}
      </>
    )
  }

  return (
    <>
      <main className={styles.pageShell}>
        <section className={styles.console} aria-labelledby="api-keys-title">
        <div className={styles.securityNotice}>
          <span aria-hidden="true">◆</span>
          <div>
            <strong>Protect every trading credential.</strong>
            <p>Secrets are shown once. Use the fewest permissions possible and restrict access by IP.</p>
          </div>
        </div>
        <p className={styles.eyebrow}>Developer security</p>
        <div className={styles.pageHeader}>
          <div>
            <h1 id="api-keys-title">API keys</h1>
            <p className={styles.subtitle}>Create scoped credentials for REST and WebSocket integrations.</p>
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={keys.length >= 20}
            onClick={() => setCreateOpen(true)}
          >
            Create API key
          </button>
        </div>
        <div className={styles.counterRow}>
          <span>{keys.length} of 20 keys</span>
          <span>HMAC-SHA256</span>
        </div>
        {loading ? (
          <div className={styles.loadingState} role="status">
            <span className={styles.spinner} aria-hidden="true" /> Loading API keys…
          </div>
        ) : null}
        {!loading && keys.length >= 20 ? (
          <p className={styles.warningBanner} role="status">Key limit reached. Revoke an unused key before creating another.</p>
        ) : null}
        {!loading && keys.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">＋</span>
            <h2>No API keys yet</h2>
            <p>Create a scoped key for your first integration.</p>
          </div>
        ) : null}
        {!loading && keys.length > 0 ? (
          <div className={styles.tableFrame}>
            <table className={styles.keyTable}>
              <caption>Your API keys</caption>
              <colgroup>
                <col className={styles.labelColumn} />
                <col className={styles.keyColumn} />
                <col className={styles.createdColumn} />
                <col className={styles.permissionsColumn} />
                <col className={styles.ipColumn} />
                <col className={styles.statusColumn} />
                <col className={styles.actionsColumn} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Label</th>
                  <th scope="col">API key</th>
                  <th scope="col">Created</th>
                  <th scope="col">Permissions</th>
                  <th scope="col">IP access</th>
                  <th scope="col">Status</th>
                  <th scope="col" className={styles.actionsHeader}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => {
                  const label = key.label || 'Untitled key'
                  const permissions = key.api_permissions
                    .split(',')
                    .map((permission) => permission.trim())
                    .filter(Boolean)
                  const creationDate = formatCreationDate(key.api_key_creation_date)
                  const enabled = key.api_key_status === 'ENABLED'
                  const revoked = key.api_key_status === 'REVOKED'
                  const statusLabel = enabled ? 'Enabled' : revoked ? 'Revoked' : 'Disabled'
                  const statusClass = enabled
                    ? styles.statusEnabled
                    : revoked
                      ? styles.statusRevoked
                      : styles.statusDisabled
                  return (
                    <tr key={key.api_key}>
                      <td data-label="Label">
                        <strong className={styles.keyLabel}>{label}</strong>
                      </td>
                      <td data-label="API key">
                        <div className={styles.keyValueRow}>
                          <code>{maskAccessKey(key.api_key)}</code>
                          <button
                            type="button"
                            className={styles.copyButton}
                            aria-label={`Copy access key for ${label}`}
                            onClick={() => copyValue(key.api_key, `row-${key.api_key}`)}
                          >
                            {copiedField === `row-${key.api_key}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </td>
                      <td data-label="Created">
                        {creationDate ? (
                          <time className={styles.createdTime} dateTime={key.api_key_creation_date}>
                            {creationDate.date} · {creationDate.time}
                          </time>
                        ) : (
                          <span className={styles.missingValue}>—</span>
                        )}
                      </td>
                      <td data-label="Permissions">
                        <div className={styles.badgeRow}>
                          {permissions.map((permission) => (
                            <span className={styles.permissionBadge} key={permission}>{permission}</span>
                          ))}
                        </div>
                      </td>
                      <td data-label="IP access">
                        <span className={!key.api_key_ip_whitelist ? styles.anyIp : undefined}>
                          {key.api_key_ip_whitelist || 'Any IP'}
                        </span>
                      </td>
                      <td data-label="Status">
                        <span className={statusClass}>
                          <span aria-hidden="true" />
                          {statusLabel}
                        </span>
                      </td>
                      <td data-label="Actions">
                        {revoked ? (
                          <span className={`${styles.noActions} ${styles.compactAction}`}>Locked</span>
                        ) : (
                          <div className={styles.actionRow}>
                            <button
                              type="button"
                              className={`${styles.secondaryButton} ${styles.compactAction}`}
                              aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
                              disabled={pendingKey === key.api_key}
                              onClick={() => handleStatusChange(key)}
                            >
                              {enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              type="button"
                              className={`${styles.dangerTextButton} ${styles.compactAction}`}
                              aria-label={`Revoke ${label}`}
                              disabled={pendingKey === key.api_key}
                              onClick={() => {
                                setRevokeTarget(key)
                                setRevokeConfirmation('')
                              }}
                            >
                              Revoke
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
        {createOpen ? (
          <div className={styles.modalBackdrop}>
            <div ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="create-key-title">
              <form onSubmit={handleCreate}>
                <div className={styles.modalHeader}>
                  <div>
                    <p className={styles.eyebrow}>New credential</p>
                    <h2 id="create-key-title">Create API key</h2>
                  </div>
                  <button
                    type="button"
                    className={styles.closeButton}
                    aria-label="Close create key form"
                    onClick={() => setCreateOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <label className={styles.fieldLabel} htmlFor="api-key-label">Key label <span>Optional</span></label>
                <input
                  className={styles.input}
                  id="api-key-label"
                  aria-label="Key label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Trading bot"
                  autoFocus
                />

                <fieldset className={styles.permissionFieldset}>
                  <legend>Permissions</legend>
                  {(['READ', 'TRADE', 'WALLET'] as ApiPermission[]).map((permission) => (
                    <label className={styles.permissionOption} key={permission}>
                      <input
                        type="checkbox"
                        aria-label={permission}
                        checked={permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                      />
                      <span>
                        <strong>{permission}</strong>
                        <small>
                          {permission === 'READ'
                            ? 'View account and market data'
                            : permission === 'TRADE'
                              ? 'Place and manage orders'
                              : 'Manage transfers and withdrawals'}
                        </small>
                      </span>
                    </label>
                  ))}
                </fieldset>

                <label className={styles.fieldLabel} htmlFor="api-key-ip-allowlist">IP allowlist <span>Recommended</span></label>
                <textarea
                  className={styles.textarea}
                  id="api-key-ip-allowlist"
                  value={ipAllowlist}
                  onChange={(event) => setIpAllowlist(event.target.value)}
                  placeholder="203.0.113.8, 203.0.113.0/24"
                />
                {!ipAllowlist.trim() ? (
                  <p className={styles.warningNote} role="note">Any IP can use this key. Add exact IPs or CIDR ranges for stronger protection.</p>
                ) : null}
                {permissions.includes('WALLET') ? (
                  <p className={styles.dangerNote} role="note">WALLET permission can authorize withdrawals and transfers.</p>
                ) : null}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={busy}
                  >
                    {busy ? 'Creating…' : 'Create key'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
        {createdKey ? (
          <div className={styles.modalBackdrop}>
            <div ref={modalRef} className={`${styles.modal} ${styles.secretModal}`} role="dialog" aria-modal="true" aria-labelledby="save-secret-title">
              <span className={styles.successIcon} aria-hidden="true">✓</span>
              <p className={styles.eyebrow}>One-time credentials</p>
              <h2 id="save-secret-title">Save your API secret now</h2>
              <p>The secret will not be shown again after this window closes.</p>

              <p className={styles.fieldLabel}>Access key</p>
              <div className={styles.credentialBox}>
                <code>{createdKey.api_key}</code>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => copyValue(createdKey.api_key, 'created-access-key')}
                >
                  {copiedField === 'created-access-key' ? 'Copied' : 'Copy access key'}
                </button>
              </div>

              <p className={styles.fieldLabel}>API secret</p>
              <div className={`${styles.credentialBox} ${styles.secretBox}`}>
                <code>{createdKey.api_secret}</code>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => copyValue(createdKey.api_secret, 'created-secret')}
                >
                  {copiedField === 'created-secret' ? 'Copied' : 'Copy API secret'}
                </button>
              </div>

              <label className={styles.acknowledgment}>
                <input
                  type="checkbox"
                  checked={secretSaved}
                  onChange={(event) => setSecretSaved(event.target.checked)}
                />
                I have saved the API secret
              </label>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={!secretSaved}
                onClick={() => {
                  setCreatedKey(null)
                  setSecretSaved(false)
                }}
              >
                Close credentials
              </button>
            </div>
          </div>
        ) : null}
        {revokeTarget ? (
          <div className={styles.modalBackdrop}>
            <div ref={modalRef} className={`${styles.modal} ${styles.revokeModal}`} role="dialog" aria-modal="true" aria-labelledby="revoke-key-title">
              <span className={styles.dangerIcon} aria-hidden="true">!</span>
              <p className={styles.eyebrow}>Permanent action</p>
              <h2 id="revoke-key-title">Revoke API key</h2>
              <p>
                <strong>{revokeTarget.label || 'Untitled key'}</strong> will stop working immediately and cannot be restored.
              </p>
              <label className={styles.fieldLabel} htmlFor="revoke-confirmation">Type REVOKE to confirm</label>
              <input
                className={styles.input}
                id="revoke-confirmation"
                value={revokeConfirmation}
                onChange={(event) => setRevokeConfirmation(event.target.value)}
                autoComplete="off"
                autoFocus
              />
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setRevokeTarget(null)
                    setRevokeConfirmation('')
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  disabled={revokeConfirmation !== 'REVOKE' || pendingKey === revokeTarget.api_key}
                  onClick={handleRevoke}
                >
                  Revoke key permanently
                </button>
              </div>
            </div>
          </div>
        ) : null}
        </section>
      </main>
      {toast}
    </>
  )
}
