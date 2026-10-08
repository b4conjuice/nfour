import { transformTextToNote } from '@bacondotbuild/n4'

import type { NoteOptions } from '../types'

export function transformNoteFields(noteOptions: NoteOptions) {
  const { text, tags } = noteOptions
  const { title, body, list } = transformTextToNote(text)
  return {
    text,
    title,
    body,
    list,
    tags,
  }
}
