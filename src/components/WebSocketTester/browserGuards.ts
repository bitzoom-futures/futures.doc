export function canUseInteractiveWebSocket(channel: { requiresAuth: boolean }): boolean {
  return !channel.requiresAuth
}
