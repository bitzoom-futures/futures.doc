import React from 'react'
import type { ChannelConfig } from '../types'
import styles from '../styles/WebSocketTester.module.css'

interface ChannelSelectorProps {
  channels: ChannelConfig[]
  selectedChannelId: string
  onChange: (id: string) => void
}

export default function ChannelSelector({ channels, selectedChannelId, onChange }: ChannelSelectorProps) {
  return (
    <div className={styles.panel}>
      <h3>Channel</h3>
      <select className={styles.input} value={selectedChannelId} onChange={(e) => onChange(e.target.value)}>
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.path}
          </option>
        ))}
      </select>
    </div>
  )
}
