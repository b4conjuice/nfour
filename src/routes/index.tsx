import { createFileRoute } from '@tanstack/react-router'

import TopNav from '#/components/top-nav'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <TopNav />
      <main className='flex grow flex-col p-4'>
        <div className='flex grow flex-col items-center justify-center space-y-4'>
          <p>welcome</p>
        </div>
      </main>
    </>
  )
}
