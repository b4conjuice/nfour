import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Show } from '@clerk/tanstack-react-start'
import {
  Bars2Icon,
  DocumentTextIcon,
  ListBulletIcon,
  PencilSquareIcon,
} from '@heroicons/react/20/solid'
import classNames from 'classnames'

import TopNav from '@/components/top-nav'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/notes/$noteId')({
  component: RouteComponent,
})

const editNoteUrl = (noteId: string) => `https://n4.dlopez.app/notes/${noteId}`
const markdownNoteUrl = (noteId: string) => `https://md.n4.dlopez.app/${noteId}`

function RouteComponent() {
  const { noteId } = Route.useParams()
  const trpc = useTRPC()
  const { data: note } = useQuery(
    trpc.notes.getById.queryOptions({
      id: Number(noteId),
    })
  )
  const hasMarkdown = !!note?.markdown
  return (
    <>
      <Show when='signed-out'>
        <TopNav />
      </Show>
      <div className='flex grow flex-col p-4'>
        <pre className='whitespace-pre-wrap'>{note?.text}</pre>
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
        <div className='flex space-x-6'>
          <a
            href={markdownNoteUrl(noteId)}
            className={classNames(
              'text-cb-yellow hover:text-cb-yellow/75',
              !hasMarkdown ? 'pointer-events-none opacity-25' : ''
            )}
            target='_blank'
          >
            <DocumentTextIcon className='h-6 w-6' />
          </a>
          <a
            href={`${editNoteUrl(noteId)}?tab=list`}
            className='text-cb-yellow hover:text-cb-yellow/75'
            target='_blank'
          >
            <ListBulletIcon className='h-6 w-6' />
          </a>
          <a
            href={editNoteUrl(noteId)}
            className='text-cb-yellow hover:text-cb-yellow/75'
            target='_blank'
          >
            <PencilSquareIcon className='h-6 w-6' />
          </a>
        </div>
      </footer>
    </>
  )
}
