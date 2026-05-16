import { createTRPCRouter } from './init'

import { notesRouter } from '@/integrations/trpc/routers/notes'

export const trpcRouter = createTRPCRouter({
  notes: notesRouter,
})
export type TRPCRouter = typeof trpcRouter
