import type { z } from 'zod'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { notes } from '@/db/schema'

// Auto-generated Zod schemas from Drizzle
export const NoteSelectSchema = createSelectSchema(notes)
export const NoteInsertSchema = createInsertSchema(notes)

// Custom schemas for specific operations
export const NoteOptionsSchema = NoteInsertSchema.pick({
  text: true,
  tags: true,
})

// Derived types (kept close to source of truth)
export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
export type NoteOptions = z.infer<typeof NoteOptionsSchema>
