import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Show } from '@clerk/tanstack-react-start'
import {
  ArrowDownOnSquareIcon,
  ArrowTopRightOnSquareIcon,
  Bars2Icon,
  CheckIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ListBulletIcon,
  PencilSquareIcon,
  ShareIcon,
} from '@heroicons/react/20/solid'
import { useCopyToClipboard } from '@uidotdev/usehooks'
import classNames from 'classnames'

import TopNav from '@/components/top-nav'
import Modal from '@/components/modal'
import List from '@/components/list'
import { useTRPC } from '@/integrations/trpc/react'
import NavigateCommandPalette from '@/components/navigate-command-palette'
import { editNoteUrl, markdownNoteUrl } from '@/lib/constants'
import useTextarea from '@/lib/useTextarea'
import useBeforeUnload from '@/lib/useBeforeUnload'
import Textarea from '@/components/textarea'
import { DEFAULT_TITLE } from '@/routes/__root'
import { getNoteTitle } from '@/server/notes'

const TABS = ['default', 'list', 'share'] as const
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
  const isDefaultView = tab === 'default'
  const isListView = tab === 'list'
  const isShareView = tab === 'share'
  const [, copyToClipboard] = useCopyToClipboard()
  const [copied, setCopied] = useState<'text' | 'url' | null>(null)
  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(null), 1500)
    return () => clearTimeout(timeout)
  }, [copied])
  const [shareUrl, setShareUrl] = useState('')
  useEffect(() => {
    setShareUrl(`${window.location.origin}${window.location.pathname}`)
  }, [])
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
  useBeforeUnload(hasChanges)
  const canSave = !(!hasChanges || text === '')
  const save = async () => {
    if (!note || !canSave || isSavingNote) return
    await saveNote({
      noteOptions: {
        text,
        tags: note.tags,
      },
      id: note.id,
    })
  }
  useHotkey('Mod+S', save, {
    preventDefault: true,
    enabled: canSave && !isSavingNote,
  })
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
      ) : isShareView ? (
        <main className='flex grow flex-col gap-2 p-2'>
          <button
            type='button'
            title='copy note'
            className='bg-cb-blue hover:bg-cb-off-blue relative w-full overflow-x-auto rounded-lg p-4 text-left'
            onClick={async () => {
              await copyToClipboard(text)
              setCopied('text')
            }}
          >
            <pre className='font-mono text-sm whitespace-pre'>
              <code>{text}</code>
            </pre>
            <span className='text-cb-yellow absolute top-2 right-2 flex items-center gap-1 text-xs'>
              {copied === 'text' ? (
                <>
                  <CheckIcon className='h-4 w-4' /> copied
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className='h-4 w-4' /> copy
                </>
              )}
            </span>
          </button>
          <h2 className='px-2'>url</h2>
          <button
            type='button'
            title='copy url'
            className='bg-cb-blue hover:bg-cb-off-blue text-cb-yellow flex w-full items-center justify-between rounded-lg px-2 py-3 text-left'
            onClick={async () => {
              await copyToClipboard(shareUrl)
              setCopied('url')
            }}
          >
            <span className='overflow-x-auto'>{shareUrl}</span>
            <span className='flex items-center gap-1 text-xs'>
              {copied === 'url' ? (
                <>
                  <CheckIcon className='h-4 w-4' /> copied
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className='h-4 w-4' /> copy
                </>
              )}
            </span>
          </button>
        </main>
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
              setTab('share')
            }}
            disabled={isShareView}
          >
            <ShareIcon className='h-6 w-6' />
          </button>
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
            disabled={isDefaultView}
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
              onClick={save}
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
      <NavigateCommandPalette
        commands={[
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
            id: 'go-to-share',
            title: 'go to share',
            action: () => {
              window.open(`${editNoteUrl(noteId)}?tab=share`, '_blank')
            },
          },
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
