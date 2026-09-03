import { z } from 'zod'
import { auth } from '@clerk/tanstack-react-start/server'
import { TRPCError } from '@trpc/server'
import type { TRPCRouterRecord } from '@trpc/server'

import { publicProcedure } from '../init'

import { getNote, getNotes, saveNote } from '@/db/notes'
import { transformNoteFields } from '@/lib/transforms/notes'
import { NoteOptionsSchema } from '@/lib/types'

export const notesRouter = {
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const noteId = input.id

      return await getNote(noteId)
    }),
  getAll: publicProcedure
    .input(z.object({ offset: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await getNotes(input?.offset)
    }),
  saveNote: publicProcedure
    .input(
      z.object({
        id: z.number().optional(),
        noteOptions: NoteOptionsSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { noteOptions, id } = input

      const user = await auth()

      if (!user.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'unauthorized - you must be signed in',
        })
      }

      const note = {
        ...transformNoteFields(noteOptions),
        author: user.userId,
        ...(id ? { id } : {}),
      }

      const { id: noteId } = await saveNote(note)

      return noteId
    }),
} satisfies TRPCRouterRecord
