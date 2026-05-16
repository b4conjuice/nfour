import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import TopNav from '@/components/top-nav'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const trpc = useTRPC()
  const { data: notes } = useQuery(trpc.notes.getAll.queryOptions())
  return (
    <>
      <TopNav />
      <main className='flex grow flex-col gap-4 px-4'>
        <ul className='flex flex-col gap-4'>
          {notes?.map(note => (
            <li key={note.id}>
              <Link
                to='/notes/$noteId'
                params={{
                  noteId: String(note.id),
                }}
                className='text-cb-pink hover:text-cb-pink/75'
              >
                {note.title}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
