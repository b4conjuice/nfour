import type { NoteOptions } from '../types'

export function transformTextToNote(text: string) {
  const [title, ...bodyArray] = text.split('\n\n')
  const isList = title.startsWith('= ')
  const body = bodyArray.join('\n\n')
  const listItems = body.split('\n')
  const list = isList ? listItems.filter(item => item !== '') : []

  // TODO: hdndle markdown `#`

  // TODO: handle yml `<`

  // TODO: handle snips `$`
  // MAYBE?

  return {
    title,
    body,
    list,
  }
}

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
