import { create } from 'zustand'

// Site-wide interaction state: the expanded domain / the hovered domain / whether the intro has been passed
interface StoreState {
  active: string | null // id of the currently expanded domain (null = overview)
  hovered: string | null // id of the hovered domain
  entered: boolean // whether the entrance has been passed
  setActive: (id: string | null) => void
  setHovered: (id: string | null) => void
  enter: () => void
}

export const useStore = create<StoreState>((set) => ({
  active: null,
  hovered: null,
  entered: false,
  setActive: (id) => set({ active: id }),
  setHovered: (id) => set({ hovered: id }),
  enter: () => set({ entered: true }),
}))

// Dev-only debug hook: use __store.getState().setActive('ads') in the console
declare global {
  interface Window {
    __store?: typeof useStore
  }
}
if (import.meta.env.DEV) window.__store = useStore
