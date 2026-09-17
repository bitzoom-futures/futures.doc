import { describe, expect, it } from 'vitest'

import { canUseInteractiveWebSocket } from '../src/components/WebSocketTester/browserGuards'

describe('browser authentication guards', () => {
  it('keeps only public WebSocket channels interactive', () => {
    expect(canUseInteractiveWebSocket({ requiresAuth: false })).toBe(true)
    expect(canUseInteractiveWebSocket({ requiresAuth: true })).toBe(false)
  })
})
