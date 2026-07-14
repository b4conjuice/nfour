import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Show } from '@clerk/tanstack-react-start'
import { PencilSquareIcon } from '@heroicons/react/20/solid'

import TopNav from '@/components/top-nav'
import { useTRPC } from '@/integrations/trpc/react'
import NoteList from '@/components/note-list'
import NoteListSkeleton from '@/components/note-list-skeleton'
import { newNoteUrl } from '@/lib/constants'

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
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'></div>
        <div className='flex space-x-6'>
          <a
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            href={newNoteUrl}
            target='_blank'
          >
            <PencilSquareIcon className='h-6 w-6' />
          </a>
        </div>
      </footer>
    </>
  )
}
