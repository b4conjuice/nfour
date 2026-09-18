import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Show } from '@clerk/tanstack-react-start'
import { ArrowDownOnSquareIcon, Bars2Icon } from '@heroicons/react/20/solid'
import { useLocalStorage } from '@uidotdev/usehooks'

import TopNav from '@/components/top-nav'
import Textarea from '@/components/textarea'
import useTextarea from '@/lib/useTextarea'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/notes/new')({
  component: RouteComponent,
})

const initialText = ''

function RouteComponent() {
  const navigate = useNavigate()
  const trpc = useTRPC()
  const { mutateAsync: saveNote, isPending: isSavingNote } = useMutation(
    trpc.notes.saveNote.mutationOptions()
  )
  const [text, setText] = useLocalStorage('nfour-new-note-text', initialText)
  const hasChanges = text !== initialText
  const canSave = !(!hasChanges || text === '')

  const textarea = useTextarea({ text, setText })
  return (
    <>
      <Show when='signed-out'>
        <TopNav />
      </Show>
      <main className='flex grow flex-col gap-4'>
        <Show when='signed-out'>
          <p className='px-4'>login to save your note</p>
        </Show>
        <Textarea
          {...textarea}
          textareaProps={{
            placeholder: 'new note',
          }}
        />
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
