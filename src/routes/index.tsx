import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Show } from '@clerk/tanstack-react-start'
import {
  ArrowPathIcon,
  ChevronDownIcon,
  PencilSquareIcon,
} from '@heroicons/react/20/solid'

import TopNav from '@/components/top-nav'
import { useTRPC, useTRPCClient } from '@/integrations/trpc/react'
import NoteList from '@/components/note-list'
import NoteListSkeleton from '@/components/note-list-skeleton'
import { newNoteUrl } from '@/lib/constants'

const PAGE_SIZE = 100

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
  const trpcClient = useTRPCClient()
  const { q } = Route.useSearch()

  const query = useInfiniteQuery({
    queryKey: trpc.notes.getAll.queryKey({ q }),
    queryFn: ({ pageParam }) =>
      trpcClient.notes.getAll.query({ offset: pageParam, q }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return lastPageParam + PAGE_SIZE
    },
    placeholderData: previousData => previousData,
  })

  const notes = query.data?.pages.flat() ?? []

  return (
    <>
      <TopNav />
      <main className='flex grow flex-col gap-4 px-4'>
        <Show when='signed-out'>
          <p>login to see your notes</p>
        </Show>
        <Show when='signed-in'>
          {query.data === undefined ? (
            <NoteListSkeleton />
          ) : (
            <>
              <NoteList notes={notes} />
              {query.hasNextPage && (
                <button
                  onClick={() => {
                    query.fetchNextPage()
                  }}
                  disabled={query.isFetchingNextPage}
                  className='text-cb-yellow bg-cb-blue border-cb-blue hover:border-cb-pink mx-auto rounded-lg border p-2 disabled:pointer-events-none disabled:opacity-25'
                >
                  {query.isFetchingNextPage ? (
                    <>
                      <ArrowPathIcon
                        className='h-6 w-6 animate-spin'
                        aria-hidden='true'
                      />
                      <span className='sr-only'>Loading</span>
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className='h-6 w-6' aria-hidden='true' />
                      <span className='sr-only'>Load More</span>
                    </>
                  )}
                </button>
              )}
            </>
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
