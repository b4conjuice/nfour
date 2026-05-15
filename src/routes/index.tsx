import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className='flex grow flex-col p-4'>
      <div className='flex grow flex-col items-center justify-center space-y-4'>
        <h1 className='font-bold'>nfour</h1>
      </div>
    </main>
  )
}
