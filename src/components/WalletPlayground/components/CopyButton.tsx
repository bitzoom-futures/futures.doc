import React, { useCallback, useRef, useState } from 'react'
import styles from '../styles/WalletPlayground.module.css'

interface Props {
  text: string
  label?: string
}

export default function CopyButton({ text, label = 'Copy' }: Props) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }, [text])

  return (
    <button className={styles.button} onClick={handleCopy} style={{ width: '60px', textAlign: 'center' }}>
      {copied ? <span style={{ color: '#16a34a' }}>{'\u2713'}</span> : label}
    </button>
  )
}
