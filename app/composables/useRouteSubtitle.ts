import { getRouteSubtitle } from '~/utils/navigation'

export const useRouteSubtitle = () => {
  const route = useRoute()
  return computed(() => getRouteSubtitle(route.path))
}
