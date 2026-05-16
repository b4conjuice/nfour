import { Link } from '@tanstack/react-router'

import type { Note } from '@/lib/types'

export default function NoteList({ notes }: { notes: Note[] }) {
  return (
    <ul className='divide-cb-dusty-blue divide-y'>
      {notes.map(note => (
        <li key={note.id} className='group flex gap-2'>
          <Link
            to='/notes/$noteId'
            params={{
              noteId: String(note.id),
            }}
            className='text-cb-pink hover:text-cb-pink/75 flex grow items-center justify-between py-4 group-first:pt-0'
          >
            {note.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}
