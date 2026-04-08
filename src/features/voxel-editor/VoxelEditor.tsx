import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { exportVoxelsToGlb } from './exportGLTF'
import { GroundPlane } from './GroundPlane'
import { VoxelCursor } from './VoxelCursor'
import { VoxelGrid } from './VoxelGrid'
import { useVoxelStore } from './useVoxelStore'
import type { VoxelTool } from './types'

const SAVE_FILE_NAME = 'voxel-scene.json'
const EXPORT_FILE_NAME = 'voxel-scene.glb'

function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  anchor.click()

  URL.revokeObjectURL(url)
}

function getMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function VoxelEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const voxels = useVoxelStore((state) => state.voxels)
  const canUndo = useVoxelStore((state) => state.canUndo)
  const canRedo = useVoxelStore((state) => state.canRedo)
  const selectedTool = useVoxelStore((state) => state.selectedTool)
  const selectedColor = useVoxelStore((state) => state.selectedColor)
  const cursorPreview = useVoxelStore((state) => state.cursorPreview)
  const loadError = useVoxelStore((state) => state.loadError)

  const setTool = useVoxelStore((state) => state.setTool)
  const setColor = useVoxelStore((state) => state.setColor)
  const setCursorPreview = useVoxelStore((state) => state.setCursorPreview)
  const clearCursorPreview = useVoxelStore((state) => state.clearCursorPreview)
  const clearLoadError = useVoxelStore((state) => state.clearLoadError)
  const upsertVoxel = useVoxelStore((state) => state.upsertVoxel)
  const removeVoxel = useVoxelStore((state) => state.removeVoxel)
  const clearVoxels = useVoxelStore((state) => state.clearVoxels)
  const undo = useVoxelStore((state) => state.undo)
  const redo = useVoxelStore((state) => state.redo)
  const toJSON = useVoxelStore((state) => state.toJSON)
  const loadJSON = useVoxelStore((state) => state.loadJSON)

  const controls = useControls('Voxel Controls', {
    tool: {
      value: selectedTool,
      options: { Place: 'place', Remove: 'remove' },
    },
    color: {
      value: selectedColor,
      label: 'Voxel color',
    },
  }) as { tool: VoxelTool; color: string }

  useEffect(() => {
    if (controls.tool !== selectedTool) {
      setTool(controls.tool)
    }
  }, [controls.tool, selectedTool, setTool])

  useEffect(() => {
    if (controls.color !== selectedColor) {
      setColor(controls.color)
    }
  }, [controls.color, selectedColor, setColor])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isPrimaryModifier = event.metaKey || event.ctrlKey
      const isUndoKey = event.key.toLowerCase() === 'z'

      if (!isPrimaryModifier || !isUndoKey) {
        return
      }

      event.preventDefault()

      if (event.shiftKey) {
        redo()
        setStatusMessage('Redid the last voxel change.')
        return
      }

      if (event.altKey) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undo()
        setStatusMessage('Undid the last voxel change.')
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [redo, undo])

  const shouldCommitEdit = (event: { delta: number }) => {
    return event.delta <= 2
  }

  const handleSaveJson = () => {
    clearLoadError()
    setStatusMessage(`Saved ${voxels.length} voxel${voxels.length === 1 ? '' : 's'} to JSON.`)
    downloadFile(new Blob([toJSON()], { type: 'application/json' }), SAVE_FILE_NAME)
  }

  const handleExportGlb = async () => {
    try {
      clearLoadError()
      const blob = await exportVoxelsToGlb(voxels)
      downloadFile(blob, EXPORT_FILE_NAME)
      setStatusMessage(`Exported ${voxels.length} voxel${voxels.length === 1 ? '' : 's'} to GLB.`)
    } catch (error) {
      setStatusMessage(getMessage(error, 'Unable to export the current voxel scene.'))
    }
  }

  const handleLoadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file === undefined) {
      return
    }

    try {
      const raw = await file.text()
      const result = loadJSON(raw)

      if (result.ok) {
        setStatusMessage(`Loaded ${file.name} into the editor.`)
      } else {
        setStatusMessage(null)
      }
    } catch (error) {
      setStatusMessage(getMessage(error, 'Unable to read the selected JSON file.'))
    } finally {
      event.target.value = ''
    }
  }

  return (
    <EditorShell>
      <Leva collapsed={false} oneLineLabels hideCopyButton />

      <HeaderCard>
        <HeaderCopy>
          <Eyebrow>Ticket 4</Eyebrow>
          <Title>Voxel editor</Title>
          <Lead>
            Place cubes with click, orbit to inspect the scene, switch to remove mode when you need to carve, and keep the JSON/GLB export loop entirely in the browser.
          </Lead>
        </HeaderCopy>

        <SummaryGrid>
          <SummaryCard>
            <span>Mode</span>
            <strong>{selectedTool === 'place' ? 'Place voxels' : 'Remove voxels'}</strong>
          </SummaryCard>
          <SummaryCard>
            <span>Scene size</span>
            <strong>{voxels.length} voxel{voxels.length === 1 ? '' : 's'}</strong>
          </SummaryCard>
          <SummaryCard>
            <span>Selected color</span>
            <ColorSwatch style={{ backgroundColor: selectedColor }} />
          </SummaryCard>
        </SummaryGrid>
      </HeaderCard>

      <ContentGrid>
        <CanvasCard>
          <CanvasFrame>
            <Canvas camera={{ position: [8, 8, 10], fov: 45 }} shadows>
              <color attach="background" args={['#0a1118']} />
              <fog attach="fog" args={['#0a1118', 18, 42]} />
              <ambientLight intensity={0.55} />
              <directionalLight
                castShadow
                intensity={2.4}
                position={[10, 14, 8]}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <hemisphereLight intensity={0.45} groundColor="#091018" color="#d6e9ff" />

              <GroundPlane
                selectedTool={selectedTool}
                onPreview={setCursorPreview}
                shouldCommitEdit={shouldCommitEdit}
                onPlace={upsertVoxel}
              />
              <VoxelGrid
                voxels={voxels}
                selectedTool={selectedTool}
                onPreview={setCursorPreview}
                shouldCommitEdit={shouldCommitEdit}
                onPlace={upsertVoxel}
                onRemove={removeVoxel}
              />
              <VoxelCursor
                preview={cursorPreview}
                selectedColor={selectedColor}
                selectedTool={selectedTool}
              />
              <OrbitControls
                makeDefault
                enableDamping
                maxPolarAngle={Math.PI / 2.05}
                minDistance={5}
                maxDistance={28}
                onStart={clearCursorPreview}
              />
            </Canvas>
          </CanvasFrame>
        </CanvasCard>

        <SidebarCard>
          <ActionGroup>
            <ActionButton type="button" onClick={handleSaveJson}>
              Save JSON
            </ActionButton>
            <ActionButton type="button" onClick={() => fileInputRef.current?.click()}>
              Load JSON
            </ActionButton>
            <ActionButton type="button" onClick={handleExportGlb}>
              Export GLB
            </ActionButton>
            <SecondaryButton
              type="button"
              onClick={() => {
                undo()
                setStatusMessage('Undid the last voxel change.')
              }}
              disabled={!canUndo}
            >
              Undo
            </SecondaryButton>
            <SecondaryButton
              type="button"
              onClick={() => {
                redo()
                setStatusMessage('Redid the last voxel change.')
              }}
              disabled={!canRedo}
            >
              Redo
            </SecondaryButton>
            <SecondaryButton
              type="button"
              onClick={() => {
                clearVoxels()
                clearCursorPreview()
                clearLoadError()
                setStatusMessage('Cleared the current voxel scene.')
              }}
            >
              Clear scene
            </SecondaryButton>
          </ActionGroup>

          <InfoList>
            <li>Ground clicks place voxels on the y=0 layer.</li>
            <li>Face clicks add the next voxel on the selected face normal.</li>
            <li>Orbit with drag; placement happens on click only.</li>
            <li>Invalid JSON keeps the current scene intact and shows an in-app error.</li>
          </InfoList>

          {statusMessage !== null ? <NoticeBanner aria-live="polite">{statusMessage}</NoticeBanner> : null}
          {loadError !== null ? <ErrorBanner aria-live="polite">{loadError}</ErrorBanner> : null}

          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleLoadFile}
          />
        </SidebarCard>
      </ContentGrid>
    </EditorShell>
  )
}

const EditorShell = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(245, 132, 32, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(86, 137, 255, 0.16), transparent 22%),
    linear-gradient(180deg, #0f1821 0%, #091017 100%);
  color: #f5f7fb;

  @media (max-width: 720px) {
    padding: 16px;
  }
`

const HeaderCard = styled.section`
  display: grid;
  gap: 20px;
  margin: 0 auto 20px;
  padding: 24px;
  max-width: 1440px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  background: rgba(10, 15, 23, 0.78);
  backdrop-filter: blur(14px);

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.9fr);
    align-items: end;
  }
`

const HeaderCopy = styled.div`
  display: grid;
  gap: 10px;
`

const Eyebrow = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #f7a95c;
`

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 0.95;
`

const Lead = styled.p`
  max-width: 70ch;
  margin: 0;
  color: #c0cada;
  line-height: 1.65;
`

const SummaryGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
`

const SummaryCard = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);

  span {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #90a1b6;
  }

  strong {
    font-size: 1rem;
    font-weight: 700;
  }
`

const ColorSwatch = styled.span`
  display: inline-flex;
  width: 100%;
  min-height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
`

const ContentGrid = styled.section`
  display: grid;
  flex: 1;
  gap: 20px;
  min-height: 0;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;

  @media (min-width: 1080px) {
    align-items: stretch;
  }

  @media (min-width: 1080px) {
    grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.7fr);
  }
`

const CanvasCard = styled.section`
  min-width: 0;
  display: flex;
`

const CanvasFrame = styled.div`
  flex: 1;
  min-height: clamp(420px, calc(100vh - 240px), 999px);
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 15, 23, 0.82);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);

  canvas {
    display: block;
  }

  @media (max-width: 1079px) {
    min-height: clamp(420px, 70vh, 760px);
  }
`

const SidebarCard = styled.aside`
  display: grid;
  gap: 16px;
  align-content: start;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 15, 23, 0.78);
  backdrop-filter: blur(14px);
`

const ActionGroup = styled.div`
  display: grid;
  gap: 12px;
`

const ActionButton = styled.button`
  min-height: 48px;
  border: 0;
  border-radius: 14px;
  padding: 0 16px;
  font: inherit;
  font-weight: 700;
  color: #081018;
  background: linear-gradient(135deg, #f59f45 0%, #ffce72 100%);
  cursor: pointer;
`

const SecondaryButton = styled(ActionButton)`
  color: #eff4fb;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`

const InfoList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #b8c3d6;
  line-height: 1.6;
`

const NoticeBanner = styled.p`
  margin: 0;
  padding: 14px 16px;
  border-radius: 16px;
  color: #ffe5bf;
  background: rgba(245, 159, 69, 0.14);
  border: 1px solid rgba(245, 159, 69, 0.28);
`

const ErrorBanner = styled.p`
  margin: 0;
  padding: 14px 16px;
  border-radius: 16px;
  color: #ffd5d1;
  background: rgba(198, 49, 49, 0.16);
  border: 1px solid rgba(198, 49, 49, 0.34);
`

const HiddenInput = styled.input`
  display: none;
`
