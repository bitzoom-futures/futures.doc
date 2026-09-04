import { useEffect, useRef, useState } from 'react'
import { NILE_URL, TRONWEB_CDN } from '../constants'

// Standalone UMD build that exposes window.buffer.Buffer without require()
const BUFFER_CDN = 'https://bundle.run/buffer@6.0.3'

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

export function useTronWeb() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tronWeb, setTronWeb] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    const init = async () => {
      try {
        // TronWeb needs Node.js Buffer in browser — polyfill it
        if (typeof window.Buffer === 'undefined') {
          await loadScript(BUFFER_CDN)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const bufferLib = (window as any).buffer
          if (bufferLib?.Buffer) {
            window.Buffer = bufferLib.Buffer
          }
        }

        if (!window.TronWeb) {
          await loadScript(TRONWEB_CDN)
        }

        if (window.TronWeb) {
          setTronWeb(new window.TronWeb({ fullHost: NILE_URL }))
        } else {
          setError('TronWeb failed to initialize')
        }
      } catch (e: unknown) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  return { tronWeb, loading, error }
}
