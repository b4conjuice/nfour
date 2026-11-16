import { useEffect, useRef, useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebounce, useLocalStorage } from '@uidotdev/usehooks'
import { TagIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'

import CommandPalette from '@/components/command-palette'
import Modal from '@/components/modal'
import { EditTags } from '@/components/tags'
import { useTRPC } from '@/integrations/trpc/react'
import type { Note } from '@/lib/types'

const routeApi = getRouteApi('/')

export default function NoteList({ notes }: { notes: Note[] }) {
  const searchParams = routeApi.useSearch()
  const query = searchParams.q
  const navigate = routeApi.useNavigate()

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutateAsync: saveNote } = useMutation(
    trpc.notes.saveNote.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.notes.getAll.pathFilter())
      },
    })
  )

  const [isSetTagsModalOpen, setIsSetTagsModalOpen] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const selectedNote = notes.find(note => note.id === selectedNoteId)

  const [search, setSearch] = useState(query ?? '')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    navigate({
      search: { q: debouncedSearch || undefined },
    })
  }, [debouncedSearch, navigate])

  const [selectedTags, setSelectedTags] = useLocalStorage<string[]>(
    'nfour-selected-tags',
    []
  )
  const allTags = [
    ...new Set(
      notes.reduce((currentAllTags: string[], note: Note) => {
        const { tags } = note
        const noteTags = [...tags]
        return [...currentAllTags, ...noteTags]
      }, selectedTags)
    ),
  ]

  const taggedNotes = notes.filter(note =>
    selectedTags.length > 0
      ? selectedTags.every(tag => note.tags.includes(tag))
      : true
  )

  const firstTagButtonRef = useRef<HTMLButtonElement | null>(null)
  return (
    <>
      <div className='flex'>
        <input
          type='text'
          className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
          placeholder='search'
          value={search}
          onChange={e => {
            setSearch(e.target.value)
          }}
        />
      </div>
      {allTags.length > 0 && (
        <ul className='flex space-x-2 overflow-x-auto'>
          {allTags.map((tag, index) => (
            <li key={tag}>
              <button
                ref={index === 0 ? firstTagButtonRef : undefined}
                className={classNames(
                  'bg-cb-blue rounded-lg border p-2',
                  selectedTags.includes(tag)
                    ? 'border-cb-pink'
                    : 'border-cb-blue'
                )}
                onClick={() => {
                  const selectedTagIndex = selectedTags.findIndex(
                    t => t === tag
                  )
                  const newSelectedTags = [...selectedTags]
                  if (selectedTagIndex > -1) {
                    newSelectedTags.splice(selectedTagIndex, 1)
                  } else {
                    newSelectedTags.push(tag)
                  }
                  setSelectedTags(newSelectedTags)
                }}
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}
      {taggedNotes.length === 0 && (search || selectedTags.length > 0) && (
        <p>no results found</p>
      )}
      <ul className='divide-cb-dusty-blue divide-y'>
        {taggedNotes.map(note => (
          <li key={note.id} className='group flex gap-2'>
            <Link
              to='/notes/$noteId'
              params={{
                noteId: String(note.id),
              }}
              className='text-cb-pink hover:text-cb-pink/75 flex grow items-center justify-between py-4 group-first:pt-0'
            >
              <div>
                <div>{note.title}</div>
                {note.tags.length > 0 && <div>{note.tags.join(' ')}</div>}
              </div>
            </Link>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => {
                  setSelectedNoteId(note.id)
                  setIsSetTagsModalOpen(true)
                }}
                tabIndex={-1}
                className='text-cb-yellow hover:text-cb-yellow/75'
              >
                <TagIcon className='h-6 w-6' />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={isSetTagsModalOpen}
        setIsOpen={setIsSetTagsModalOpen}
        title='edit tags'
      >
        {selectedNote && (
          <EditTags
            note={selectedNote}
            allTags={allTags}
            onSave={async tags => {
              await saveNote({
                id: selectedNote.id,
                noteOptions: {
                  text: selectedNote.text,
                  tags,
                },
              })
            }}
          />
        )}
      </Modal>
      <CommandPalette
        commands={[
          ...notes.map(note => ({
            id: `go-note-${note.id}`,
            title: `go to note: ${note.title}`,
            action: () => {
              navigate({
                to: '/notes/$noteId',
                params: {
                  noteId: String(note.id),
                },
              })
            },
          })),
          ...allTags.map(tag => ({
            id: `toggle-tag-${tag}`,
            title: `toggle tag: ${tag}`,
            action: () => {
              const index = selectedTags.findIndex(t => t === tag)
              const newSelectedTags = [...selectedTags]
              if (index > -1) {
                newSelectedTags.splice(index, 1)
              } else {
                newSelectedTags.push(tag)
              }
              setSelectedTags(newSelectedTags)
            },
          })),
          {
            id: 'toggle-all-tags-off',
            title: 'toggle all tags off',
            action: () => {
              setSelectedTags([])
            },
          },
          {
            id: 'new-note',
            title: 'go to new note',
            action: () => {
              navigate({
                to: '/notes/new',
              })
            },
          },
        ]}
      />
    </>
  )
}
