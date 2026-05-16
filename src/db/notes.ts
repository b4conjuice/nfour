import { auth } from '@clerk/tanstack-react-start/server'
import { and } from 'drizzle-orm'

import { db } from '@/db'

const LIMIT = 100

export async function getNotes() {
  const user = await auth()

  if (!user.userId) throw new Error('unauthorized')

  return await db.query.notes.findMany({
    where: (model, { eq }) => eq(model.author, user.userId),
    orderBy: (model, { desc }) => desc(model.updatedAt),
    limit: LIMIT,
  })
}

export async function getNote(id: number) {
  const note = await db.query.notes.findFirst({
    where: (model, { eq }) => and(eq(model.id, id)),
  })

  return note
}
