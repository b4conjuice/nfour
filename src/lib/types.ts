// types.ts
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

import type { notes } from '@/db/schema'

// SELECT * FROM users → what you get back
export type Note = InferSelectModel<typeof notes>

// INSERT INTO users (...) → what you can send
export type NewNote = InferInsertModel<typeof notes>
