import type { SavedVoxelModel, Voxel, GridPosition } from './types'
import { createVoxelId } from './types'

export const VOXEL_EDITOR_STORAGE_KEYS = {
  autosave: 'voxel-editor.autosave',
  savedModels: 'voxel-editor.saved-models',
} as const

function getStorage(): Storage {
  if (typeof window === 'undefined') {
    throw new Error('Browser storage is unavailable in this environment.')
  }

  return window.localStorage
}

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

function normalizeSavedVoxelModel(input: unknown): SavedVoxelModel | null {
  if (typeof input !== 'object' || input === null) {
    return null
  }

  const candidate = input as Record<string, unknown>

  if (
    typeof candidate.name !== 'string' ||
    candidate.name.trim().length === 0 ||
    typeof candidate.updatedAt !== 'string' ||
    !Array.isArray(candidate.voxels)
  ) {
    return null
  }

  const voxels = candidate.voxels.map(normalizeVoxel)

  if (voxels.some((voxel) => voxel === null)) {
    return null
  }

  return {
    name: candidate.name.trim(),
    updatedAt: candidate.updatedAt,
    voxels: dedupeVoxels(voxels.filter((voxel): voxel is Voxel => voxel !== null)),
  }
}

export function parseVoxelScene(raw: string): Voxel[] {
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

export function serializeVoxels(voxels: Voxel[]): string {
  return JSON.stringify(voxels, null, 2)
}

export function readAutosavedVoxels(): Voxel[] | null {
  const raw = getStorage().getItem(VOXEL_EDITOR_STORAGE_KEYS.autosave)

  if (raw === null) {
    return null
  }

  return parseVoxelScene(raw)
}

export function writeAutosavedVoxels(voxels: Voxel[]): void {
  getStorage().setItem(VOXEL_EDITOR_STORAGE_KEYS.autosave, serializeVoxels(voxels))
}

export function clearAutosavedVoxels(): void {
  getStorage().removeItem(VOXEL_EDITOR_STORAGE_KEYS.autosave)
}

export function readSavedVoxelModels(): SavedVoxelModel[] {
  const raw = getStorage().getItem(VOXEL_EDITOR_STORAGE_KEYS.savedModels)

  if (raw === null) {
    return []
  }

  const parsed = JSON.parse(raw) as unknown

  if (!Array.isArray(parsed)) {
    throw new Error('Saved voxel models data must be an array.')
  }

  const models = parsed.map(normalizeSavedVoxelModel)

  if (models.some((model) => model === null)) {
    throw new Error('Saved voxel models data contains an invalid entry.')
  }

  return models.filter((model): model is SavedVoxelModel => model !== null)
}

export function writeSavedVoxelModels(models: SavedVoxelModel[]): void {
  getStorage().setItem(VOXEL_EDITOR_STORAGE_KEYS.savedModels, JSON.stringify(models))
}