import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'

import type { Note } from '@/lib/types'

export function EditTags({
  note,
  allTags,
  onSave,
}: {
  note: Note
  allTags: string[]
  onSave: (tags: string[]) => Promise<void> | void
}) {
  const [newTag, setNewTag] = useState('')
  const tags = [...new Set([...allTags, ...note.tags])]

  const toggleTag = (tag: string) => {
    const newTags = [...note.tags]
    const index = newTags.findIndex(t => t === tag)
    if (index > -1) {
      newTags.splice(index, 1)
    } else {
      newTags.push(tag)
    }
    onSave(newTags)
  }

  return (
    <>
      <p>{note.title}</p>
      <ul className='grid grid-cols-6 gap-2'>
        {tags.map(tag => (
          <li key={tag}>
            <button
              type='button'
              className={classNames(
                'bg-cb-blue rounded-lg border p-2',
                note.tags.includes(tag) ? 'border-cb-pink' : 'border-cb-blue'
              )}
              onClick={() => {
                toggleTag(tag)
              }}
            >
              {tag}
            </button>
          </li>
        ))}
      </ul>
      <form
        className='space-y-3'
        onSubmit={e => {
          e.preventDefault()
          const tag = newTag.trim()
          if (tag === '') return
          onSave([...new Set([...note.tags, tag])])
          setNewTag('')
        }}
      >
        <input
          className='bg-cobalt w-full'
          placeholder='new tag'
          value={newTag}
          onChange={e => {
            setNewTag(e.target.value)
          }}
        />
        <button
          type='submit'
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          disabled={newTag.trim() === ''}
        >
          <PlusIcon className='h-6 w-6' />
        </button>
      </form>
    </>
  )
}
