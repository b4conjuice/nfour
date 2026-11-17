import { useLocation, useNavigate, useRouter } from '@tanstack/react-router'

import CommandPalette from '@/components/command-palette'
import type { Command } from '@/components/command-palette'
import { routeTree } from '@/routeTree.gen'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'go home',
  '/notes/new': 'go new note',
}

function getRoutes(route: typeof routeTree): string[] {
  return [
    route.fullPath,
    ...Object.values(route.children ?? {}).map(child => child.fullPath),
  ].filter(
    (path, index, paths) =>
      path.startsWith('/') &&
      !path.includes('$') &&
      !path.startsWith('/api') &&
      paths.indexOf(path) === index
  )
}

export default function NavigateCommandPalette({
  commands,
}: {
  commands?: Command[]
}) {
  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate()
  const router = useRouter()
  const routes = getRoutes(routeTree)
  const navigateRoutesCommands = routes
    .filter(route => route !== currentPath)
    .map(route => ({
      id: `go-${route === '/' ? 'home' : route}`,
      title:
        ROUTE_TITLES[route] ??
        `go ${route === '/' ? 'home' : route.replaceAll('/', ' ').trim()}`,
      action: () => {
        navigate({
          to: route,
        })
      },
    }))
  const defaultCommands = [
    ...navigateRoutesCommands,
    {
      id: 'go-back',
      title: 'go back',
      action: () => {
        router.history.back()
      },
    },
  ]

  return (
    <CommandPalette
      toggleIsOpenHotKey='N'
      placeholder='navigate to'
      commands={[...(commands ?? []), ...defaultCommands]}
    />
  )
}
