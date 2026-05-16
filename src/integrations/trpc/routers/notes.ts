import { z } from 'zod'

import { publicProcedure } from '../init'

import type { TRPCRouterRecord } from '@trpc/server'
import { getNote, getNotes } from '@/db/notes'

export const notesRouter = {
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const noteId = input.id

      return await getNote(noteId)
    }),
  getAll: publicProcedure.query(async () => {
    return await getNotes()
  }),
} satisfies TRPCRouterRecord
