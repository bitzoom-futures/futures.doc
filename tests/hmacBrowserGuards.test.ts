import { describe, expect, it } from 'vitest'

import { isHmacOperation } from '../src/theme/ApiExplorer/Request/isHmacOperation'
import { canUseInteractiveWebSocket } from '../src/components/WebSocketTester/browserGuards'

describe('browser authentication guards', () => {
  it('identifies transformed private REST operations by extension', () => {
    expect(
      isHmacOperation({
        extensions: [
          { key: 'x-release', value: 'next' },
          { key: 'x-bitzoom-hmac', value: true },
        ],
      })
    ).toBe(true)
    expect(isHmacOperation({ extensions: [{ key: 'x-bitzoom-hmac', value: false }] })).toBe(false)
    expect(isHmacOperation({})).toBe(false)
  })

  it('keeps only public WebSocket channels interactive', () => {
    expect(canUseInteractiveWebSocket({ requiresAuth: false })).toBe(true)
    expect(canUseInteractiveWebSocket({ requiresAuth: true })).toBe(false)
  })
})
