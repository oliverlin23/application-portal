import { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen min-w-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <main className="w-full max-w-md">{children}</main>
    </div>
  )
}

