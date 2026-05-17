import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Show } from '@clerk/tanstack-react-start'

import TopNav from '@/components/top-nav'
import { useTRPC } from '@/integrations/trpc/react'
import NoteList from '@/components/note-list'
import NoteListSkeleton from '@/components/note-list-skeleton'

export const Route = createFileRoute('/')({
  component: Home,
  validateSearch: (search: Record<string, string>) => {
    return {
      q: search.q ? String(search.q) : undefined,
    }
  },
})

function Home() {
  const trpc = useTRPC()
  const { data: notes } = useQuery(trpc.notes.getAll.queryOptions())
  return (
    <>
      <TopNav />
      <main className='flex grow flex-col gap-4 px-4'>
        <Show when='signed-out'>
          <p>login to see your notes</p>
        </Show>
        <Show when='signed-in'>
          {notes === undefined ? (
            <NoteListSkeleton />
          ) : (
            <NoteList notes={notes} />
          )}
        </Show>
      </main>
    </>
  )
}
