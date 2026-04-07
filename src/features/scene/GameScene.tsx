import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

import {
  CanvasFrame,
  ContentPanel,
  Eyebrow,
  Heading,
  InlineCode,
  Lead,
  OverlayBadge,
  ScenePage,
  ScenePanel,
  StatusCard,
  StatusGrid,
} from './GameScene.styles'

function RotatingBox() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return
    }

    meshRef.current.rotation.x += delta * 0.4
    meshRef.current.rotation.y += delta * 0.65
  })

  return (
    <mesh ref={meshRef} position={[0, 0.35, 0]} castShadow>
      <boxGeometry args={[1.35, 1.35, 1.35]} />
      <meshStandardMaterial color="#7ad2ff" metalness={0.2} roughness={0.15} />
    </mesh>
  )
}

function SceneLights() {
  return (
    <>
      <color attach="background" args={['#09111a']} />
      <fog attach="fog" args={['#09111a', 6, 14]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        intensity={1.8}
        position={[3.5, 5, 3.2]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight intensity={18} color="#45d9a8" position={[-3.5, 1.75, -2.5]} />
    </>
  )
}

function SceneContent() {
  return (
    <>
      <SceneLights />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.85, 0]}>
        <circleGeometry args={[5.5, 64]} />
        <meshStandardMaterial color="#101824" roughness={0.95} />
      </mesh>
      <RotatingBox />
    </>
  )
}

export function GameScene() {
  return (
    <ScenePage>
      <ScenePanel>
        <CanvasFrame>
          <OverlayBadge>First Playable Surface</OverlayBadge>
          <Canvas camera={{ position: [0, 1.8, 5], fov: 45 }} shadows>
            <SceneContent />
          </Canvas>
        </CanvasFrame>
      </ScenePanel>

      <ContentPanel>
        <Eyebrow>React Three Fiber Setup</Eyebrow>
        <Heading>Browser-first 3D foundation, ready for the next system.</Heading>
        <Lead>
          This replaces the Vite starter with the first game-facing surface: a
          minimal 3D scene rendered through React. The current ticket keeps the
          scope intentionally tight so the stack, build, and deployment path are
          proven before gameplay systems arrive.
        </Lead>

        <StatusGrid>
          <StatusCard>
            <h2>Scene Proof</h2>
            <p>Canvas, camera, lighting, and a visible mesh are now the baseline.</p>
          </StatusCard>
          <StatusCard>
            <h2>Hosting Path</h2>
            <p>Vite is prepared for GitHub Pages pathing and CI deployment.</p>
          </StatusCard>
          <StatusCard>
            <h2>Offline Boundary</h2>
            <p>Manifest groundwork exists, but full offline support is deferred.</p>
          </StatusCard>
          <StatusCard>
            <h2>Next Move</h2>
            <p>
              Build on <InlineCode>src/features/scene</InlineCode> for controls,
              game state, and asset loading.
            </p>
          </StatusCard>
        </StatusGrid>
      </ContentPanel>
    </ScenePage>
  )
}