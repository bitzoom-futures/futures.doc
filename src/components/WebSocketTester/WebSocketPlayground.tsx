import React, { useMemo, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { channels, getChannel } from './channels/channelConfigs'
import ChannelSelector from './components/ChannelSelector'
import WebSocketTester from './WebSocketTester'

export interface WebSocketPlaygroundProps {
  defaultServerUrl?: string
  initialChannelId?: string
  maxMessages?: number
}

export default function WebSocketPlayground({
  defaultServerUrl,
  initialChannelId = 'ticker',
  maxMessages
}: WebSocketPlaygroundProps) {
  const { siteConfig } = useDocusaurusContext()
  const generatedServerUrl =
    (siteConfig.customFields && (siteConfig.customFields as Record<string, unknown>).gatewayServerUrl) || ''
  const resolvedDefaultServerUrl =
    defaultServerUrl || (typeof generatedServerUrl === 'string' ? generatedServerUrl : undefined)
  const safeInitial = channels.some((channel) => channel.id === initialChannelId)
    ? initialChannelId
    : channels[0].id
  const [channelId, setChannelId] = useState(safeInitial)

  const selectedChannel = useMemo(() => getChannel(channelId), [channelId])

  return (
    <div>
      <ChannelSelector channels={channels} selectedChannelId={selectedChannel.id} onChange={setChannelId} />
      <WebSocketTester
        channel={selectedChannel}
        defaultServerUrl={resolvedDefaultServerUrl}
        maxMessages={maxMessages}
      />
    </div>
  )
}
