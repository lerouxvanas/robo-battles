import type { ThreeEvent } from '@react-three/fiber'
import type { Vector3 } from 'three'

import type { GridPosition, Voxel, VoxelTool } from './types'

type VoxelGridProps = {
  voxels: Voxel[]
  selectedTool: VoxelTool
  onPreview: (position: GridPosition | null) => void
  shouldCommitEdit: (event: ThreeEvent<MouseEvent>) => boolean
  onPlace: (position: GridPosition) => void
  onRemove: (position: GridPosition) => void
}

function getAdjacentPosition(voxel: Voxel, normal: Vector3 | null): GridPosition | null {
  if (normal === null) {
    return null
  }

  return {
    x: voxel.x + Math.round(normal.x),
    y: voxel.y + Math.round(normal.y),
    z: voxel.z + Math.round(normal.z),
  }
}

export function VoxelGrid({
  voxels,
  selectedTool,
  onPreview,
  shouldCommitEdit,
  onPlace,
  onRemove,
}: VoxelGridProps) {
  const handlePointerMove = (voxel: Voxel) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()

    if (selectedTool !== 'place') {
      onPreview(null)
      return
    }

    onPreview(getAdjacentPosition(voxel, event.face?.normal ?? null))
  }

  const handleClick = (voxel: Voxel) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()

    if (!shouldCommitEdit(event)) {
      return
    }

    if (selectedTool === 'remove') {
      onRemove(voxel)
      return
    }

    const nextPosition = getAdjacentPosition(voxel, event.face?.normal ?? null)

    if (nextPosition !== null) {
      onPlace(nextPosition)
    }
  }

  return (
    <>
      {voxels.map((voxel) => (
        <mesh
          key={voxel.id}
          castShadow
          receiveShadow
          position={[voxel.x, voxel.y, voxel.z]}
          onPointerMove={handlePointerMove(voxel)}
          onPointerOut={() => onPreview(null)}
          onClick={handleClick(voxel)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={voxel.color} flatShading />
        </mesh>
      ))}
    </>
  )
}
