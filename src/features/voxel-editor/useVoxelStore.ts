import { create } from 'zustand'

import type { CursorPreview, GridPosition, Voxel, VoxelTool } from './types'
import { createVoxelId } from './types'

type LoadResult = {
  ok: boolean
  message?: string
}

type VoxelState = {
  voxels: Voxel[]
  history: Voxel[][]
  future: Voxel[][]
  selectedTool: VoxelTool
  selectedColor: string
  cursorPreview: CursorPreview
  loadError: string | null
  canUndo: boolean
  canRedo: boolean
  setTool: (tool: VoxelTool) => void
  setColor: (color: string) => void
  setCursorPreview: (preview: CursorPreview) => void
  clearCursorPreview: () => void
  clearLoadError: () => void
  upsertVoxel: (position: GridPosition, color?: string) => void
  removeVoxel: (position: GridPosition) => void
  clearVoxels: () => void
  undo: () => void
  redo: () => void
  reset: () => void
  toJSON: () => string
  loadJSON: (raw: string) => LoadResult
}

const DEFAULT_COLOR = '#f97316'
const MAX_HISTORY_ENTRIES = 50

function normalizeVoxel(input: unknown): Voxel | null {
  if (typeof input !== 'object' || input === null) {
    return null
  }

  const candidate = input as Record<string, unknown>

  if (
    !Number.isInteger(candidate.x) ||
    !Number.isInteger(candidate.y) ||
    !Number.isInteger(candidate.z) ||
    typeof candidate.color !== 'string' ||
    typeof candidate.id !== 'string'
  ) {
    return null
  }

  const position: GridPosition = {
    x: candidate.x as number,
    y: candidate.y as number,
    z: candidate.z as number,
  }

  return {
    id: createVoxelId(position),
    ...position,
    color: candidate.color,
  }
}

function dedupeVoxels(voxels: Voxel[]): Voxel[] {
  return Array.from(new Map(voxels.map((voxel) => [voxel.id, voxel])).values())
}

function parseVoxelScene(raw: string): Voxel[] {
  const parsed = JSON.parse(raw) as unknown

  if (!Array.isArray(parsed)) {
    throw new Error('Voxel scene JSON must be an array of voxels.')
  }

  const voxels = parsed.map(normalizeVoxel)

  if (voxels.some((voxel) => voxel === null)) {
    throw new Error('Voxel scene JSON contains an invalid voxel entry.')
  }

  return dedupeVoxels(voxels.filter((voxel): voxel is Voxel => voxel !== null))
}

function serializeVoxels(voxels: Voxel[]): string {
  return JSON.stringify(voxels, null, 2)
}

function pushHistory(history: Voxel[][], voxels: Voxel[]): Voxel[][] {
  return [...history, voxels].slice(-MAX_HISTORY_ENTRIES)
}

const initialState = {
  voxels: [] as Voxel[],
  history: [] as Voxel[][],
  future: [] as Voxel[][],
  selectedTool: 'place' as VoxelTool,
  selectedColor: DEFAULT_COLOR,
  cursorPreview: null as CursorPreview,
  loadError: null as string | null,
  canUndo: false,
  canRedo: false,
}

export const useVoxelStore = create<VoxelState>((set, get) => ({
  ...initialState,

  setTool: (tool) => {
    set({ selectedTool: tool })
  },

  setColor: (color) => {
    set({ selectedColor: color })
  },

  setCursorPreview: (preview) => {
    set({ cursorPreview: preview })
  },

  clearCursorPreview: () => {
    set({ cursorPreview: null })
  },

  clearLoadError: () => {
    set({ loadError: null })
  },

  upsertVoxel: (position, color) => {
    const nextVoxel: Voxel = {
      id: createVoxelId(position),
      ...position,
      color: color ?? get().selectedColor,
    }

    set((state) => {
      const nextVoxels = dedupeVoxels([
        ...state.voxels.filter((voxel) => voxel.id !== nextVoxel.id),
        nextVoxel,
      ])

      const didChange = JSON.stringify(nextVoxels) !== JSON.stringify(state.voxels)

      if (!didChange) {
        return { loadError: null }
      }

      const history = pushHistory(state.history, state.voxels)

      return {
        voxels: nextVoxels,
        history,
        future: [],
        canUndo: history.length > 0,
        canRedo: false,
        loadError: null,
      }
    })
  },

  removeVoxel: (position) => {
    const voxelId = createVoxelId(position)

    set((state) => {
      const nextVoxels = state.voxels.filter((voxel) => voxel.id !== voxelId)

      if (nextVoxels.length === state.voxels.length) {
        return { loadError: null }
      }

      const history = pushHistory(state.history, state.voxels)

      return {
        voxels: nextVoxels,
        history,
        future: [],
        canUndo: history.length > 0,
        canRedo: false,
        loadError: null,
      }
    })
  },

  clearVoxels: () => {
    set((state) => {
      if (state.voxels.length === 0) {
        return { loadError: null }
      }

      const history = pushHistory(state.history, state.voxels)

      return {
        voxels: [],
        history,
        future: [],
        canUndo: history.length > 0,
        canRedo: false,
        loadError: null,
      }
    })
  },

  undo: () => {
    set((state) => {
      const previousVoxels = state.history.at(-1)

      if (previousVoxels === undefined) {
        return state
      }

      const history = state.history.slice(0, -1)
      const future = [state.voxels, ...state.future].slice(0, MAX_HISTORY_ENTRIES)

      return {
        voxels: previousVoxels,
        history,
        future,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        loadError: null,
      }
    })
  },

  redo: () => {
    set((state) => {
      const nextVoxels = state.future[0]

      if (nextVoxels === undefined) {
        return state
      }

      const future = state.future.slice(1)
      const history = pushHistory(state.history, state.voxels)

      return {
        voxels: nextVoxels,
        history,
        future,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        loadError: null,
      }
    })
  },

  reset: () => {
    set(initialState)
  },

  toJSON: () => {
    return serializeVoxels(get().voxels)
  },

  loadJSON: (raw) => {
    try {
      const voxels = parseVoxelScene(raw)

      set((state) => {
        const history = pushHistory(state.history, state.voxels)

        return {
          voxels,
          history,
          future: [],
          canUndo: history.length > 0,
          canRedo: false,
          loadError: null,
        }
      })

      return { ok: true }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load voxel scene JSON.'

      set({ loadError: message })

      return { ok: false, message }
    }
  },
}))
