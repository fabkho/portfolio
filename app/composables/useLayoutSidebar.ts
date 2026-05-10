import type { Component, Raw } from 'vue'

interface SidebarState {
  component: Raw<Component> | null
  props: Record<string, unknown>
}

const sidebarState = ref<SidebarState>({ component: null, props: {} })

export function useLayoutSidebar() {
  function setSidebar(component: Raw<Component>, props: Record<string, unknown> = {}) {
    sidebarState.value = { component: markRaw(component) as Raw<Component>, props }
  }

  function clearSidebar() {
    sidebarState.value = { component: null, props: {} }
  }

  return {
    sidebarState: readonly(sidebarState),
    setSidebar,
    clearSidebar
  }
}
