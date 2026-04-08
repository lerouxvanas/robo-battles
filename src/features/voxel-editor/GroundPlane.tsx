import type { ThreeEvent } from '@react-three/fiber'

import type { GridPosition, VoxelTool } from './types'

type GroundPlaneProps = {
  selectedTool: VoxelTool
  onPreview: (position: GridPosition | null) => void
  shouldCommitEdit: (event: ThreeEvent<MouseEvent>) => boolean
  onPlace: (position: GridPosition) => void
}

function getGroundPosition(event: ThreeEvent<PointerEvent | MouseEvent>): GridPosition {
  return {
    x: Math.round(event.point.x),
    y: 0,
    z: Math.round(event.point.z),
  }
}

export function GroundPlane({
  selectedTool,
  onPreview,
  shouldCommitEdit,
  onPlace,
}: GroundPlaneProps) {
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()

    if (selectedTool !== 'place') {
      onPreview(null)
      return
    }

    onPreview(getGroundPosition(event))
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()

    if (selectedTool !== 'place' || !shouldCommitEdit(event)) {
      return
    }

    onPlace(getGroundPosition(event))
  }

  return (
    <>
      <gridHelper args={[60, 60, '#314156', '#1a2330']} position={[0, -0.5, 0]} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        onPointerMove={handlePointerMove}
        onPointerOut={() => onPreview(null)}
        onClick={handleClick}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#000000" transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}
