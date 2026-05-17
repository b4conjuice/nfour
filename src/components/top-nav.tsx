import {
  SignInButton,
  UserButton,
  useUser,
  Show,
} from '@clerk/tanstack-react-start'
import { Link, useLocation } from '@tanstack/react-router'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'

const title = 'nfour'

export default function TopNav() {
  const { user } = useUser()
  const username = user?.username
  const { pathname } = useLocation()
  return (
    <header className='mb-4 flex w-full items-center px-4 pt-4'>
      {pathname === '/' ? (
        <h1 className='font-bold'>{title}</h1>
      ) : (
        <Link to='/' className='hover:text-cb-pink'>
          <h1 className='font-bold'>{title}</h1>
        </Link>
      )}
      <div className='flex grow justify-end'>
        <Show when='signed-out'>
          <SignInButton>
            <ArrowRightStartOnRectangleIcon className='h-6 w-6 hover:cursor-pointer' />
          </SignInButton>
        </Show>
        <Show when='signed-in'>
          <div className='text-cb-white flex space-x-2'>
            {username && <span>{username}</span>}
            <UserButton />
          </div>
        </Show>
      </div>
    </header>
  )
}
