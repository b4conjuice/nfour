import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Show } from '@clerk/tanstack-react-start'
import {
  ArrowDownOnSquareIcon,
  Bars2Icon,
  ListBulletIcon,
  PencilSquareIcon,
} from '@heroicons/react/20/solid'
import { useLocalStorage } from '@uidotdev/usehooks'

import TopNav from '@/components/top-nav'
import Textarea from '@/components/textarea'
import List from '@/components/list'
import useTextarea from '@/lib/useTextarea'
import { useTRPC } from '@/integrations/trpc/react'
import { DEFAULT_TITLE } from '@/routes/__root'

const TABS = ['default', 'list'] as const
type Tab = (typeof TABS)[number]

const isTab = (value: unknown): value is Tab => TABS.includes(value as Tab)

export const Route = createFileRoute('/notes/new')({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>): { tab?: Tab } => {
    return {
      tab: isTab(search.tab) ? search.tab : undefined,
    }
  },
})

const initialText = ''

function RouteComponent() {
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
  const trpc = useTRPC()
  const { mutateAsync: saveNote, isPending: isSavingNote } = useMutation(
    trpc.notes.saveNote.mutationOptions()
  )
  const [text, setText] = useLocalStorage('nfour-new-note-text', initialText)
  const hasChanges = text !== initialText
  const canSave = !(!hasChanges || text === '')

  const textarea = useTextarea({ text, setText })
  const [title, ...bodyParts] = text.split('\n\n')
  const body = bodyParts.join('\n\n')
  const bodyItems =
    body === '' ? [] : body.split('\n').filter(item => item !== '')
  return (
    <>
      {isListView ? (
        <header className='mb-4 flex w-full items-center px-4 pt-4'>
          <h1 className='font-bold'>{title || DEFAULT_TITLE}</h1>
        </header>
      ) : (
        <Show when='signed-out'>
          <TopNav />
        </Show>
      )}
      <main className='flex grow flex-col gap-4'>
        <Show when='signed-out'>
          <p className='px-4'>login to save your note</p>
        </Show>
        {isListView ? (
          <List
            items={bodyItems}
            setItems={newItems => {
              const newBody = newItems.join('\n')
              setText(newBody === '' ? title : `${title}\n\n${newBody}`)
            }}
          />
        ) : (
          <Textarea
            {...textarea}
            textareaProps={{
              placeholder: 'new note',
            }}
          />
        )}
      </main>
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
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              type='button'
              onClick={async () => {
                const noteId = await saveNote({
                  noteOptions: {
                    text,
                    tags: [],
                  },
                })
                setText('')

                await navigate({
                  to: `/notes/${noteId}`,
                })
              }}
              disabled={!canSave || isSavingNote}
            >
              <ArrowDownOnSquareIcon className='h-6 w-6' />
            </button>
          </Show>
        </div>
      </footer>
    </>
  )
}
