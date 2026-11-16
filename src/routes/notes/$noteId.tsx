import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Show } from '@clerk/tanstack-react-start'
import {
  ArrowDownOnSquareIcon,
  ArrowTopRightOnSquareIcon,
  Bars2Icon,
  DocumentTextIcon,
  ListBulletIcon,
  PencilSquareIcon,
} from '@heroicons/react/20/solid'
import classNames from 'classnames'

import TopNav from '@/components/top-nav'
import Modal from '@/components/modal'
import List from '@/components/list'
import { useTRPC } from '@/integrations/trpc/react'
import CommandPalette from '@/components/command-palette'
import { editNoteUrl, markdownNoteUrl } from '@/lib/constants'
import useTextarea from '@/lib/useTextarea'
import Textarea from '@/components/textarea'
import { DEFAULT_TITLE } from '@/routes/__root'
import { getNoteTitle } from '@/server/notes'

const TABS = ['default', 'list'] as const
type Tab = (typeof TABS)[number]

const isTab = (value: unknown): value is Tab => TABS.includes(value as Tab)

export const Route = createFileRoute('/notes/$noteId')({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>): { tab?: Tab } => {
    return {
      tab: isTab(search.tab) ? search.tab : undefined,
    }
  },
  loader: async ({ params }) => {
    const title = await getNoteTitle({ data: Number(params.noteId) })
    return { title }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.title ?? DEFAULT_TITLE }],
  }),
})

function NoteSkeleton() {
  return (
    <textarea className='border-cobalt bg-cobalt caret-cb-yellow focus:border-cb-light-blue text-cb-white h-full w-full grow focus:ring-0' />
  )
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const tabNavigate = Route.useNavigate()
  const { tab: tabParam } = Route.useSearch()
  const tab = tabParam ?? 'default'
  const setTab = (newTab: Tab) => {
    tabNavigate({
      search: { tab: newTab === 'default' ? undefined : newTab },
    })
  }
  const isListView = tab === 'list'
  const { noteId } = Route.useParams()
  const trpc = useTRPC()
  const { data: note } = useQuery(
    trpc.notes.getById.queryOptions({
      id: Number(noteId),
    })
  )
  const { mutateAsync: saveNote, isPending: isSavingNote } = useMutation(
    trpc.notes.saveNote.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.notes.getById.queryFilter({ id: Number(noteId) })
        )
      },
    })
  )
  const hasMarkdown = !!note?.markdown

  const textarea = useTextarea({ initialText: note?.text ?? '' })
  const { text } = textarea
  const hasChanges = text !== (note?.text ?? '')
  const canSave = !(!hasChanges || text === '')
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [title, ...bodyParts] = text.split('\n\n')
  const body = bodyParts.join('\n\n')
  const bodyItems =
    body === '' ? [] : body.split('\n').filter(item => item !== '')
  return (
    <>
      <Show when='signed-out'>
        <TopNav />
      </Show>
      {note === undefined ? (
        <NoteSkeleton />
      ) : isListView ? (
        <>
          <TopNav title={title} />
          <main className='flex grow flex-col'>
            <List
              items={bodyItems}
              setItems={newItems => {
                const newBody = newItems.join('\n')
                textarea.setText(
                  newBody === '' ? title : `${title}\n\n${newBody}`
                )
              }}
            />
          </main>
        </>
      ) : (
        <Textarea {...textarea} hasChanges={hasChanges} />
      )}
      {/* <div className='flex grow flex-col p-4'>
        <pre className='whitespace-pre-wrap'>{note?.text}</pre>
      </div> */}
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          {hasChanges ? (
            <button
              className='text-cb-yellow hover:text-cb-yellow/75'
              type='button'
              onClick={() => setShowDiscardConfirm(true)}
            >
              <Bars2Icon className='h-6 w-6' />
            </button>
          ) : (
            <Link
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              to='/'
            >
              <Bars2Icon className='h-6 w-6' />
            </Link>
          )}
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
            href={editNoteUrl(noteId)}
            className='text-cb-yellow hover:text-cb-yellow/75'
            target='_blank'
          >
            <ArrowTopRightOnSquareIcon className='h-6 w-6' />
          </a>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setTab('list')
            }}
            disabled={isListView}
          >
            <ListBulletIcon className='h-6 w-6' />
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setTab('default')
            }}
            disabled={!isListView}
          >
            <PencilSquareIcon className='h-6 w-6' />
          </button>
          <Show when='signed-in'>
            <button
              className={classNames(
                'hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25',
                canSave ? 'text-cb-orange' : 'text-cb-yellow'
              )}
              type='button'
              onClick={async () => {
                if (!note) return
                await saveNote({
                  noteOptions: {
                    text,
                    tags: note.tags,
                  },
                  id: note.id,
                })
              }}
              disabled={!note || !canSave || isSavingNote}
            >
              <ArrowDownOnSquareIcon className='h-6 w-6' />
            </button>
          </Show>
        </div>
      </footer>
      <Modal
        title='unsaved changes'
        isOpen={showDiscardConfirm}
        setIsOpen={setShowDiscardConfirm}
      >
        <p>
          there are unsaved changes, are you sure you would like to discard them
          and go back to notes?
        </p>
        <div className='flex gap-4'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75'
            type='button'
            onClick={() => setShowDiscardConfirm(false)}
          >
            cancel
          </button>
          <button
            className='text-cb-orange hover:text-cb-orange/75'
            type='button'
            onClick={() => {
              setShowDiscardConfirm(false)
              navigate({ to: '/' })
            }}
          >
            discard & go back
          </button>
        </div>
      </Modal>
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
