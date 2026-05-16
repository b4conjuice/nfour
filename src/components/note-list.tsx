import { getRouteApi, Link } from '@tanstack/react-router'

import type { Note } from '@/lib/types'
import useSearch from '@/lib/useSearch'

const routeApi = getRouteApi('/')

export default function NoteList({ notes }: { notes: Note[] }) {
  const searchParams = routeApi.useSearch()
  const query = searchParams.q
  const navigate = routeApi.useNavigate()

  const { search, setSearch, results, searchRef } = useSearch({
    initialSearch: query ? String(query) : '',
    // list: taggedNotes || [],
    list: notes,
    options: {
      keys: ['title', 'body'],
    },
  })
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
    </>
  )
}
