import type { CursorPreview, VoxelTool } from './types'

type VoxelCursorProps = {
  preview: CursorPreview
  selectedColor: string
  selectedTool: VoxelTool
}

export function VoxelCursor({ preview, selectedColor, selectedTool }: VoxelCursorProps) {
  if (selectedTool !== 'place' || preview === null) {
    return null
  }

  return (
    <mesh position={[preview.x, preview.y, preview.z]}>
      <boxGeometry args={[1.02, 1.02, 1.02]} />
      <meshStandardMaterial
        color={selectedColor}
        emissive={selectedColor}
        emissiveIntensity={0.35}
        opacity={0.35}
        transparent
      />
    </mesh>
  )
}
