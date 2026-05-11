export function useGridVariant() {
  function getVariant(index: number): 'hatched' | 'default' {
    return index % 2 === 0 ? 'hatched' : 'default'
  }

  return { getVariant }
}
