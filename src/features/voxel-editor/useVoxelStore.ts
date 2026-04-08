import { create } from 'zustand'

import {
  parseVoxelScene,
  readAutosavedVoxels,
  readSavedVoxelModels,
  serializeVoxels,
  writeAutosavedVoxels,
  writeSavedVoxelModels,
} from './modelPersistence'
import type {
  CursorPreview,
  GridPosition,
  SavedVoxelModel,
  Voxel,
  VoxelTool,
} from './types'
import { createVoxelId } from './types'

type LoadResult = {
  ok: boolean
  message?: string
}

type VoxelState = {
  voxels: Voxel[]
  history: Voxel[][]
  future: Voxel[][]
  savedModels: SavedVoxelModel[]
  activeSavedModelName: string | null
  savedModelsSearch: string
  isSavedModelsPanelOpen: boolean
  persistenceLoaded: boolean
  persistenceError: string | null
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
  clearPersistenceError: () => void
  initializePersistence: () => void
  persistAutosave: () => PersistDraftResult
  saveNamedModel: (name: string, options?: { overwrite?: boolean }) => SaveModelResult
  loadSavedModel: (name: string) => LoadResult
  renameSavedModel: (currentName: string, nextName: string) => RenameModelResult
  deleteSavedModel: (name: string) => DeleteModelResult
  setSavedModelsSearch: (value: string) => void
  setSavedModelsPanelOpen: (isOpen: boolean) => void
  toggleSavedModelsPanel: () => void
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

function dedupeVoxels(voxels: Voxel[]): Voxel[] {
  return Array.from(new Map(voxels.map((voxel) => [voxel.id, voxel])).values())
}

function sortSavedModels(models: SavedVoxelModel[]): SavedVoxelModel[] {
  return [...models].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

function pushHistory(history: Voxel[][], voxels: Voxel[]): Voxel[][] {
  return [...history, voxels].slice(-MAX_HISTORY_ENTRIES)
}

const initialState = {
  voxels: [] as Voxel[],
  history: [] as Voxel[][],
  future: [] as Voxel[][],
  savedModels: [] as SavedVoxelModel[],
  activeSavedModelName: null as string | null,
  savedModelsSearch: '',
  isSavedModelsPanelOpen: true,
  persistenceLoaded: false,
  persistenceError: null as string | null,
  selectedTool: 'place' as VoxelTool,
  selectedColor: DEFAULT_COLOR,
  cursorPreview: null as CursorPreview,
  loadError: null as string | null,
  canUndo: false,
  canRedo: false,
}
type SaveModelResult = {
  ok: boolean
  message?: string
  reason?: 'empty-name' | 'duplicate-name' | 'storage-error'
}

type RenameModelResult = {
  ok: boolean
  message?: string
  reason?: 'empty-name' | 'duplicate-name' | 'not-found' | 'storage-error'
}

type DeleteModelResult = {
  ok: boolean
  message?: string
  reason?: 'active-model' | 'not-found' | 'storage-error'
}

type PersistDraftResult = {
  ok: boolean
  message?: string
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

  clearPersistenceError: () => {
    set({ persistenceError: null })
  },

  initializePersistence: () => {
    const persistenceErrors: string[] = []
    let nextSavedModels = get().savedModels
    let nextAutosavedVoxels: Voxel[] | null = null

    try {
      nextSavedModels = sortSavedModels(readSavedVoxelModels())
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to restore the saved models browser library.'

      persistenceErrors.push(message)
    }

    try {
      nextAutosavedVoxels = readAutosavedVoxels()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to restore the autosaved voxel draft.'

      persistenceErrors.push(message)
    }

    set((state) => ({
      savedModels: nextSavedModels,
      voxels: nextAutosavedVoxels ?? state.voxels,
      persistenceLoaded: true,
      persistenceError: persistenceErrors.length > 0 ? persistenceErrors.join(' ') : null,
      loadError: null,
    }))
  },

  persistAutosave: () => {
    try {
      writeAutosavedVoxels(get().voxels)
      set({ persistenceError: null })

      return { ok: true }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save the current voxel draft.'

      set({ persistenceError: message })

      return {
        ok: false,
        message,
      }
    }
  },

  saveNamedModel: (name, options) => {
    const trimmedName = name.trim()

    if (trimmedName.length === 0) {
      const message = 'Saved model name is required.'
      set({ persistenceError: message })

      return {
        ok: false,
        message,
        reason: 'empty-name',
      }
    }

    const overwrite = options?.overwrite ?? false
    const existingModel = get().savedModels.find((model) => model.name === trimmedName)

    if (existingModel !== undefined && !overwrite) {
      return {
        ok: false,
        message: `A saved model named "${trimmedName}" already exists.`,
        reason: 'duplicate-name',
      }
    }

    try {
      const nextModel: SavedVoxelModel = {
        name: trimmedName,
        updatedAt: new Date().toISOString(),
        voxels: dedupeVoxels(get().voxels),
      }

      const remainingModels = get().savedModels.filter((model) => model.name !== trimmedName)
      const nextSavedModels = sortSavedModels([...remainingModels, nextModel])

      writeSavedVoxelModels(nextSavedModels)

      set({
        savedModels: nextSavedModels,
        activeSavedModelName: trimmedName,
        persistenceError: null,
      })

      return { ok: true }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save the current voxel model.'

      set({ persistenceError: message })

      return {
        ok: false,
        message,
        reason: 'storage-error',
      }
    }
  },

  loadSavedModel: (name) => {
    const savedModel = get().savedModels.find((model) => model.name === name)

    if (savedModel === undefined) {
      const message = `Saved model "${name}" was not found.`
      set({ persistenceError: message })

      return {
        ok: false,
        message,
      }
    }

    set((state) => {
      const history = pushHistory(state.history, state.voxels)

      return {
        voxels: savedModel.voxels,
        history,
        future: [],
        activeSavedModelName: savedModel.name,
        canUndo: history.length > 0,
        canRedo: false,
        persistenceError: null,
        loadError: null,
      }
    })

    return { ok: true }
  },

  renameSavedModel: (currentName, nextName) => {
    const trimmedNextName = nextName.trim()

    if (trimmedNextName.length === 0) {
      const message = 'Saved model name is required.'
      set({ persistenceError: message })

      return {
        ok: false,
        message,
        reason: 'empty-name',
      }
    }

    const currentModel = get().savedModels.find((model) => model.name === currentName)

    if (currentModel === undefined) {
      const message = `Saved model "${currentName}" was not found.`
      set({ persistenceError: message })

      return {
        ok: false,
        message,
        reason: 'not-found',
      }
    }

    if (trimmedNextName !== currentName && get().savedModels.some((model) => model.name === trimmedNextName)) {
      const message = `A saved model named "${trimmedNextName}" already exists.`
      set({ persistenceError: message })

      return {
        ok: false,
        message,
        reason: 'duplicate-name',
      }
    }

    try {
      const renamedModel: SavedVoxelModel = {
        ...currentModel,
        name: trimmedNextName,
        updatedAt: new Date().toISOString(),
      }

      const nextSavedModels = sortSavedModels(
        get().savedModels.map((model) => (model.name === currentName ? renamedModel : model)),
      )

      writeSavedVoxelModels(nextSavedModels)

      set((state) => ({
        savedModels: nextSavedModels,
        activeSavedModelName:
          state.activeSavedModelName === currentName ? trimmedNextName : state.activeSavedModelName,
        persistenceError: null,
      }))

      return { ok: true }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to rename the saved model.'

      set({ persistenceError: message })

      return {
        ok: false,
        message,
        reason: 'storage-error',
      }
    }
  },

  deleteSavedModel: (name) => {
    if (get().activeSavedModelName === name) {
      const message = 'The currently loaded saved model cannot be deleted.'
      set({ persistenceError: message })

      return {
        ok: false,
        message,
        reason: 'active-model',
      }
    }

    if (!get().savedModels.some((model) => model.name === name)) {
      const message = `Saved model "${name}" was not found.`
      set({ persistenceError: message })

      return {
        ok: false,
        message,
        reason: 'not-found',
      }
    }

    try {
      const nextSavedModels = get().savedModels.filter((model) => model.name !== name)

      writeSavedVoxelModels(nextSavedModels)

      set({
        savedModels: nextSavedModels,
        persistenceError: null,
      })

      return { ok: true }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to delete the saved model.'

      set({ persistenceError: message })

      return {
        ok: false,
        message,
        reason: 'storage-error',
      }
    }
  },

  setSavedModelsSearch: (value) => {
    set({ savedModelsSearch: value })
  },

  setSavedModelsPanelOpen: (isOpen) => {
    set({ isSavedModelsPanelOpen: isOpen })
  },

  toggleSavedModelsPanel: () => {
    set((state) => ({ isSavedModelsPanelOpen: !state.isSavedModelsPanelOpen }))
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
        activeSavedModelName: null,
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
        activeSavedModelName: null,
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
        activeSavedModelName: null,
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
        activeSavedModelName: null,
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
        activeSavedModelName: null,
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
          activeSavedModelName: null,
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
