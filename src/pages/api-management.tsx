import Layout from '@theme/Layout'
import useBaseUrl from '@docusaurus/useBaseUrl'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import React from 'react'

import ApiManagementConsole from '../components/ApiManagement/ApiManagementConsole'
import { DEFAULT_MANAGEMENT_GATEWAY_URL } from '../config/managementGateway'
import { useUser } from '../context/UserContext'
import { useCasdoorLogin } from '../hooks/useCasdoorLogin'

export default function ApiManagementPage() {
  const { siteConfig } = useDocusaurusContext()
  const managementGatewayUrl =
    (siteConfig.customFields?.managementGatewayUrl as string) || DEFAULT_MANAGEMENT_GATEWAY_URL
  const redirectPath = useBaseUrl('/callback')
  const { rawToken, logout } = useUser()
  const { login, error } = useCasdoorLogin({ managementGatewayUrl, redirectPath })

  return (
    <Layout
      title="API Management"
      description="Create and manage Bitzoom HMAC API keys for private REST and WebSocket integrations."
      noFooter
    >
      <ApiManagementConsole
        managementGatewayUrl={managementGatewayUrl}
        rawToken={rawToken}
        onLogin={login}
        onSessionExpired={logout}
        loginError={error}
      />
    </Layout>
  )
}
