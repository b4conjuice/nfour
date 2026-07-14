import { useRef } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { useLocalStorage } from '@uidotdev/usehooks'
import classNames from 'classnames'

import CommandPalette from '@/components/command-palette'
import type { Note } from '@/lib/types'
import useSearch from '@/lib/useSearch'

const routeApi = getRouteApi('/')

export default function NoteList({ notes }: { notes: Note[] }) {
  const searchParams = routeApi.useSearch()
  const query = searchParams.q
  const navigate = routeApi.useNavigate()

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

  const { search, setSearch, results, searchRef } = useSearch({
    initialSearch: query ? String(query) : '',
    list: taggedNotes,
    options: {
      keys: ['title', 'body'],
    },
  })

  const firstTagButtonRef = useRef<HTMLButtonElement | null>(null)
  return (
    <>
      <div className='flex'>
        <input
          ref={searchRef}
          type='text'
          className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
          placeholder='search'
          value={search}
          onChange={e => {
            const { value } = e.target
            setSearch(value)
            navigate({
              search: { q: value },
            })
          }}
          disabled={!(notes.length && notes.length > 0)}
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
      <ul className='divide-cb-dusty-blue divide-y'>
        {results.map(note => (
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
          </li>
        ))}
      </ul>
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
        ]}
      />
    </>
  )
}
