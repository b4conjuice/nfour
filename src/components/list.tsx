import { useState } from 'react'
import classNames from 'classnames'
import {
  ArrowDownIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/20/solid'

import DragDropList from '@/components/drag-drop-list'

const LIST_TYPES = ['reorder', 'select'] as const
type ListType = (typeof LIST_TYPES)[number]

const partitionBySelection = (
  items: string[],
  selectedItems: string[]
): [selected: string[], notSelected: string[]] => {
  const selected: string[] = []
  const notSelected: string[] = []
  for (const item of items) {
    if (selectedItems.includes(item)) {
      selected.push(item)
    } else {
      notSelected.push(item)
    }
  }
  return [selected, notSelected]
}

function ReorderList({
  items,
  setItems,
}: {
  items: string[]
  setItems: (items: string[]) => void
}) {
  return (
    <DragDropList
      items={items.map((item, index) => ({ id: `${item}-${index}`, item }))}
      renderItem={({ item }, index) => (
        <div className='border-cobalt bg-cobalt rounded-lg border p-3'>
          {index + 1}. {item}
        </div>
      )}
      setItems={newItems => {
        setItems(newItems.map(({ item }) => item))
      }}
      listContainerClassName='grow space-y-3 px-2'
    />
  )
}

function SelectList({
  items,
  selectedItems,
  setSelectedItems,
}: {
  items: string[]
  selectedItems: string[]
  setSelectedItems: (items: string[]) => void
}) {
  return (
    <ul className='grow space-y-3 px-2'>
      {items.map((item, index) => {
        const isSelected = selectedItems.includes(item)
        return (
          <li key={index}>
            <label
              className={classNames(
                'border-cobalt bg-cobalt flex items-center rounded-lg border p-3',
                isSelected ? 'border-cb-light-blue' : 'border-cobalt'
              )}
            >
              <span className='grow'>
                {index + 1}. {item}
              </span>
              <input
                type='checkbox'
                onChange={() => {
                  const newSelectedItems = [...selectedItems]
                  const selectedIndex = newSelectedItems.findIndex(
                    selectedItem => selectedItem === item
                  )
                  if (selectedIndex === -1) {
                    newSelectedItems.push(item)
                  } else {
                    newSelectedItems.splice(selectedIndex, 1)
                  }
                  setSelectedItems(newSelectedItems)
                }}
                checked={isSelected}
              />
            </label>
          </li>
        )
      })}
    </ul>
  )
}

export default function List({
  items,
  setItems,
}: {
  items: string[]
  setItems: (items: string[]) => void
}) {
  const [listType, setListType] = useState<ListType>('reorder')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const moveSelected = (direction: 'start' | 'end') => {
    const [selected, notSelected] = partitionBySelection(items, selectedItems)
    const newItems =
      direction === 'start'
        ? [...selected, ...notSelected]
        : [...notSelected, ...selected]
    setItems(newItems)
    setSelectedItems([])
  }

  return (
    <>
      {listType === 'select' ? (
        <SelectList
          items={items}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      ) : (
        <ReorderList items={items} setItems={setItems} />
      )}
      {listType === 'select' && (
        <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-center p-2'>
          <div className='flex space-x-4'>
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none'
              type='button'
              onClick={() => {
                moveSelected('start')
              }}
            >
              <ArrowUpIcon className='h-6 w-6' />
            </button>
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none'
              type='button'
              onClick={() => {
                moveSelected('end')
              }}
            >
              <ArrowDownIcon className='h-6 w-6' />
            </button>
          </div>
        </footer>
      )}
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-center p-2'>
        <div className='flex space-x-4'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setListType('reorder')
            }}
            disabled={listType === 'reorder'}
          >
            <ArrowsUpDownIcon className='h-6 w-6' />
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setListType('select')
            }}
            disabled={listType === 'select'}
          >
            <CheckCircleIcon className='h-6 w-6' />
          </button>
        </div>
      </footer>
    </>
  )
}
