import { Link } from '@tanstack/react-router'

import type { Note } from '@/lib/types'

export default function NoteList({ notes }: { notes: Note[] }) {
  return (
    <ul className='flex flex-col gap-4'>
      {notes.map(note => (
        <li key={note.id}>
          <Link
            to='/notes/$noteId'
            params={{
              noteId: String(note.id),
            }}
            className='text-cb-pink hover:text-cb-pink/75'
          >
            {note.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}
