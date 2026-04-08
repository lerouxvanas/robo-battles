export type VoxelTool = 'place' | 'remove'

export type GridPosition = {
  x: number
  y: number
  z: number
}

export type Voxel = GridPosition & {
  id: string
  color: string
}

export type SavedVoxelModel = {
  name: string
  updatedAt: string
  voxels: Voxel[]
}

export type CursorPreview = GridPosition | null

export function createVoxelId({ x, y, z }: GridPosition): string {
  return `${x},${y},${z}`
}
