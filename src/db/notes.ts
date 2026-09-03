import { auth } from '@clerk/tanstack-react-start/server'
import { and, eq, ilike, or } from 'drizzle-orm'

import { db } from '@/db'
import type { NewNote, Note } from '@/lib/types'
import { notes } from './schema'

const LIMIT = 100

export async function getNotes({
  offset,
  q,
}: { offset?: number; q?: string } = {}) {
  const user = await auth()

  if (!user.userId) throw new Error('unauthorized')

  return await db.query.notes.findMany({
    where: and(
      eq(notes.author, user.userId),
      q
        ? or(ilike(notes.title, `%${q}%`), ilike(notes.body, `%${q}%`))
        : undefined,
    ),
    orderBy: (model, { desc }) => desc(model.updatedAt),
    limit: LIMIT,
    offset,
  })
}

export async function getNote(id: number) {
  const note = await db.query.notes.findFirst({
    where: (model, { eq }) => and(eq(model.id, id)),
  })

  return note
}

export async function saveNote(note: Note | NewNote) {
  const newNotes = await db
    .insert(notes)
    .values(note)
    .onConflictDoUpdate({
      target: notes.id,
      set: note,
    })
    .returning()
  if (newNotes.length < 0) {
    throw new Error('something went wrong')
  }
  const newNote = newNotes[0]
  return newNote
}
