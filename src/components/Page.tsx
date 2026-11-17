import type { ReactNode } from 'react'
import { Header } from './Header'

export function Page({
  children,
  showAccount = true,
  width = 'max-w-3xl',
}: {
  children: ReactNode
  showAccount?: boolean
  width?: string
}) {
  return (
    <div className="relative min-h-screen">
      <Header showAccount={showAccount} />
      <main className={`rise mx-auto px-6 pb-24 ${width}`}>{children}</main>
    </div>
  )
}
