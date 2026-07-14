import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
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
import CommandPalette from '@/components/command-palette'
import { editNoteUrl, markdownNoteUrl } from '@/lib/constants'

export const Route = createFileRoute('/notes/$noteId')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
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
      <CommandPalette
        commands={[
          {
            id: 'go-home',
            title: 'go home',
            action: () => {
              navigate({
                to: '/',
              })
            },
          },
          ...(hasMarkdown
            ? [
                {
                  id: 'go-to-markdown',
                  title: 'go to markdown',
                  action: () => {
                    window.open(markdownNoteUrl(noteId), '_blank')
                  },
                },
              ]
            : []),
          {
            id: 'go-to-list',
            title: 'go to list',
            action: () => {
              window.open(`${editNoteUrl(noteId)}?tab=list`, '_blank')
            },
          },
          {
            id: 'go-to-edit',
            title: 'go to edit',
            action: () => {
              window.open(editNoteUrl(noteId), '_blank')
            },
          },
        ]}
      />
    </>
  )
}
