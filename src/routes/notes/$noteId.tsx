import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Show } from '@clerk/tanstack-react-start'
import { Bars2Icon } from '@heroicons/react/20/solid'

import TopNav from '@/components/top-nav'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/notes/$noteId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { noteId } = Route.useParams()
  const trpc = useTRPC()
  const { data: note } = useQuery(
    trpc.notes.getById.queryOptions({
      id: Number(noteId),
    })
  )
  return (
    <>
      <Show when='signed-out'>
        <TopNav />
      </Show>
      <div className='flex grow flex-col p-4'>
        <pre>{note?.text}</pre>
      </div>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Link
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            to='/'
          >
            <Bars2Icon className='h-6 w-6' />
          </Link>
        </div>
        <div className='flex space-x-6'></div>
      </footer>
    </>
  )
}
