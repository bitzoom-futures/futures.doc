import React from 'react'
import { UserProvider } from '../context/UserContext'

export default function Root({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>
}
