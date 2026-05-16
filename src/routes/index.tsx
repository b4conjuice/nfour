import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import TopNav from '@/components/top-nav'
import { useTRPC } from '@/integrations/trpc/react'
import NoteList from '@/components/note-list'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const trpc = useTRPC()
  const { data: notes } = useQuery(trpc.notes.getAll.queryOptions())
  return (
    <>
      <TopNav />
      <main className='flex grow flex-col gap-4 px-4'>
        {notes === undefined ? null : <NoteList notes={notes} />}
      </main>
    </>
  )
}
