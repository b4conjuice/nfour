import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getNote } from '@/db/notes'

export const getNoteTitle = createServerFn({ method: 'GET' })
  .validator(z.number())
  .handler(async ({ data: noteId }) => {
    const note = await getNote(noteId)

    return note?.title ?? null
  })
