import { useMediaQuery } from '@vueuse/core'

export function useGridVariant() {
  const isDesktop = useMediaQuery('(min-width: 769px)')

  function getVariant(index: number): 'hatched' | 'default' {
    if (isDesktop.value) {
      // Checkerboard pattern for 2-column desktop grid
      const col = index % 2
      const row = Math.floor(index / 2)
      return (col + row) % 2 === 0 ? 'hatched' : 'default'
    }
    // Standard alternating pattern for 1-column mobile grid
    return index % 2 === 0 ? 'hatched' : 'default'
  }

  return { getVariant }
}
