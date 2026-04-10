import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
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
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false)
  const [savedModelName, setSavedModelName] = useState('')
  const [renamingModelName, setRenamingModelName] = useState<string | null>(null)
  const [renameDraftName, setRenameDraftName] = useState('')

  const voxels = useVoxelStore((state) => state.voxels)
  const canUndo = useVoxelStore((state) => state.canUndo)
  const canRedo = useVoxelStore((state) => state.canRedo)
  const savedModels = useVoxelStore((state) => state.savedModels)
  const activeSavedModelName = useVoxelStore((state) => state.activeSavedModelName)
  const savedModelsSearch = useVoxelStore((state) => state.savedModelsSearch)
  const persistenceLoaded = useVoxelStore((state) => state.persistenceLoaded)
  const persistenceError = useVoxelStore((state) => state.persistenceError)
  const selectedTool = useVoxelStore((state) => state.selectedTool)
  const selectedColor = useVoxelStore((state) => state.selectedColor)
  const cursorPreview = useVoxelStore((state) => state.cursorPreview)
  const loadError = useVoxelStore((state) => state.loadError)

  const setTool = useVoxelStore((state) => state.setTool)
  const setColor = useVoxelStore((state) => state.setColor)
  const setCursorPreview = useVoxelStore((state) => state.setCursorPreview)
  const clearCursorPreview = useVoxelStore((state) => state.clearCursorPreview)
  const clearLoadError = useVoxelStore((state) => state.clearLoadError)
  const clearPersistenceError = useVoxelStore((state) => state.clearPersistenceError)
  const initializePersistence = useVoxelStore((state) => state.initializePersistence)
  const persistAutosave = useVoxelStore((state) => state.persistAutosave)
  const saveNamedModel = useVoxelStore((state) => state.saveNamedModel)
  const loadSavedModel = useVoxelStore((state) => state.loadSavedModel)
  const renameSavedModel = useVoxelStore((state) => state.renameSavedModel)
  const deleteSavedModel = useVoxelStore((state) => state.deleteSavedModel)
  const setSavedModelsSearch = useVoxelStore((state) => state.setSavedModelsSearch)
  const upsertVoxel = useVoxelStore((state) => state.upsertVoxel)
  const removeVoxel = useVoxelStore((state) => state.removeVoxel)
  const clearVoxels = useVoxelStore((state) => state.clearVoxels)
  const undo = useVoxelStore((state) => state.undo)
  const redo = useVoxelStore((state) => state.redo)
  const toJSON = useVoxelStore((state) => state.toJSON)
  const loadJSON = useVoxelStore((state) => state.loadJSON)

  useEffect(() => {
    initializePersistence()
  }, [initializePersistence])

  useEffect(() => {
    if (!persistenceLoaded) {
      return
    }

    persistAutosave()
  }, [persistAutosave, persistenceLoaded, voxels])

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

  const filteredSavedModels = savedModels.filter((model) => {
    const searchTerm = savedModelsSearch.trim().toLowerCase()

    if (searchTerm.length === 0) {
      return true
    }

    return model.name.toLowerCase().includes(searchTerm)
  })

  const handleSaveNamedModel = (overwrite = false) => {
    clearPersistenceError()

    const trimmedName = savedModelName.trim()
    const result = saveNamedModel(trimmedName, { overwrite })

    if (result.ok) {
      setSavedModelName(trimmedName)
      setStatusMessage(`Saved model "${trimmedName}" to the browser list.`)
      return
    }

    if (result.reason === 'duplicate-name' && !overwrite) {
      const shouldOverwrite = window.confirm(
        `A saved model named "${trimmedName}" already exists. Overwrite it?`,
      )

      if (shouldOverwrite) {
        handleSaveNamedModel(true)
      }

      return
    }

    if (result.message !== undefined) {
      setStatusMessage(result.message)
    }
  }

  const handleLoadSavedModel = (name: string) => {
    clearPersistenceError()
    const result = loadSavedModel(name)

    if (result.ok) {
      setSavedModelName(name)
      setStatusMessage(`Loaded saved model "${name}".`)
      return
    }

    if (result.message !== undefined) {
      setStatusMessage(result.message)
    }
  }

  const handleRenameSavedModel = (currentName: string) => {
    clearPersistenceError()
    const result = renameSavedModel(currentName, renameDraftName)

    if (result.ok) {
      setRenamingModelName(null)
      setRenameDraftName('')
      setSavedModelName(renameDraftName.trim())
      setStatusMessage(`Renamed saved model to "${renameDraftName.trim()}".`)
      return
    }

    if (result.message !== undefined) {
      setStatusMessage(result.message)
    }
  }

  const handleDeleteSavedModel = (name: string) => {
    clearPersistenceError()
    const result = deleteSavedModel(name)

    if (result.ok) {
      setStatusMessage(`Deleted saved model "${name}".`)
      return
    }

    if (result.message !== undefined) {
      setStatusMessage(result.message)
    }
  }

  const handleClearScene = () => {
    clearVoxels()
    clearCursorPreview()
    clearLoadError()
    clearPersistenceError()
    setSavedModelName('')
    setRenamingModelName(null)
    setRenameDraftName('')
    setStatusMessage('Cleared the current voxel scene.')
  }

  const handleToolSelect = (tool: VoxelTool) => {
    if (tool !== selectedTool) {
      setTool(tool)
    }
  }

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed((value) => !value)
  }

  const sceneModeLabel = selectedTool === 'place' ? 'Place voxels' : 'Remove voxels'
  const savedStateLabel = activeSavedModelName ?? 'Autosaved draft'

  return (
    <EditorShell>
      <ContentGrid $desktopCollapsed={isDesktopSidebarCollapsed}>
        <CanvasCard>
          <DesktopSidebarTrigger
            variant="outlined"
            type="button"
            onClick={toggleDesktopSidebar}
            aria-label={isDesktopSidebarCollapsed ? 'Show editor sidebar' : 'Hide editor sidebar'}
            aria-expanded={!isDesktopSidebarCollapsed}
            startIcon={<MenuIcon fontSize="small" />}
          >
            {isDesktopSidebarCollapsed ? 'Open sidebar' : 'Collapse sidebar'}
          </DesktopSidebarTrigger>

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

        <ActionMenuToggle
          type="button"
          onClick={() => setIsActionMenuOpen((value) => !value)}
          aria-label={isActionMenuOpen ? 'Hide editor sidebar' : 'Show editor sidebar'}
          aria-expanded={isActionMenuOpen}
        >
          <MenuIcon fontSize="small" />
        </ActionMenuToggle>

        <ActionMenuBackdrop
          $open={isActionMenuOpen}
          onClick={() => setIsActionMenuOpen(false)}
          aria-hidden={!isActionMenuOpen}
        />

        <SidebarCard $desktopCollapsed={isDesktopSidebarCollapsed} $open={isActionMenuOpen}>
          <SidebarHeader>
            <Box>
              <SidebarEyebrow>Voxel editor</SidebarEyebrow>
              <SidebarTitle>Editor sidebar</SidebarTitle>
            </Box>
            <SidebarHeaderActions>
              <DesktopHeaderButton
                variant="text"
                type="button"
                onClick={toggleDesktopSidebar}
                startIcon={<ChevronLeftIcon fontSize="small" />}
              >
                Collapse
              </DesktopHeaderButton>
              <CollapseButton type="button" onClick={() => setIsActionMenuOpen(false)}>
                <CloseIcon fontSize="small" />
              </CollapseButton>
            </SidebarHeaderActions>
          </SidebarHeader>

          <SidebarScrollArea>
            <SidebarSection>
              <SectionTitle>Current scene</SectionTitle>
              <SceneFacts>
                <SceneFact>
                  <span>Mode</span>
                  <strong>{sceneModeLabel}</strong>
                </SceneFact>
                <SceneFact>
                  <span>Scene size</span>
                  <strong>
                    {voxels.length} voxel{voxels.length === 1 ? '' : 's'}
                  </strong>
                </SceneFact>
                <SceneFact>
                  <span>Saved state</span>
                  <strong>{savedStateLabel}</strong>
                </SceneFact>
              </SceneFacts>
            </SidebarSection>

            <SidebarSection>
              <SectionTitle>Editing</SectionTitle>
              <ToolToggleGroup
                exclusive
                value={selectedTool}
                onChange={(_, value: VoxelTool | null) => {
                  if (value !== null) {
                    handleToolSelect(value)
                  }
                }}
              >
                <ToolToggleButton value="place">Place</ToolToggleButton>
                <ToolToggleButton value="remove">Remove</ToolToggleButton>
              </ToolToggleGroup>

              <FieldRow>
                <FieldLabel>Voxel color</FieldLabel>
                <ColorField>
                  <ColorInput
                    aria-label="Voxel color"
                    type="color"
                    value={selectedColor}
                    onChange={(event) => setColor(event.target.value)}
                  />
                  <TextInput
                    size="small"
                    fullWidth
                    value={selectedColor}
                    slotProps={{ input: { readOnly: true } }}
                  />
                  <ColorSwatch style={{ backgroundColor: selectedColor }} />
                </ColorField>
              </FieldRow>
            </SidebarSection>

            <SidebarSection>
              <SectionTitle>Actions</SectionTitle>
              <ActionGroup>
                <ActionButton variant="contained" type="button" onClick={handleSaveJson}>
                  Save JSON
                </ActionButton>
                <ActionButton variant="contained" type="button" onClick={() => fileInputRef.current?.click()}>
                  Load JSON
                </ActionButton>
                <ActionButton variant="contained" type="button" onClick={handleExportGlb}>
                  Export GLB
                </ActionButton>
                <SecondaryButton
                  variant="outlined"
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
                  variant="outlined"
                  type="button"
                  onClick={() => {
                    redo()
                    setStatusMessage('Redid the last voxel change.')
                  }}
                  disabled={!canRedo}
                >
                  Redo
                </SecondaryButton>
                <SecondaryButton variant="outlined" type="button" onClick={handleClearScene}>
                  Clear scene
                </SecondaryButton>
              </ActionGroup>
            </SidebarSection>

            <SidebarSection>
              <SectionHeader>
                <SectionTitle>Saved models</SectionTitle>
              </SectionHeader>

              <SavedModelsPanel>
                <FieldRow>
                  <FieldLabel>Model name</FieldLabel>
                  <TextInput
                    id="saved-model-name"
                    size="small"
                    fullWidth
                    type="text"
                    value={savedModelName}
                    placeholder="castle-gate"
                    onChange={(event) => setSavedModelName(event.target.value)}
                  />
                </FieldRow>

                <SecondaryButton variant="outlined" type="button" onClick={() => handleSaveNamedModel()}>
                  Save model to browser
                </SecondaryButton>

                <FieldRow>
                  <FieldLabel>Search saved models</FieldLabel>
                  <TextInput
                    id="saved-model-search"
                    size="small"
                    fullWidth
                    type="search"
                    value={savedModelsSearch}
                    placeholder="Search by model name"
                    onChange={(event) => setSavedModelsSearch(event.target.value)}
                  />
                </FieldRow>

                {!persistenceLoaded ? <MutedText>Loading browser saves...</MutedText> : null}

                {persistenceLoaded && filteredSavedModels.length === 0 ? (
                  <EmptyState>
                    {savedModels.length === 0
                      ? 'No saved models yet. Save the current scene to start a browser library.'
                      : 'No saved models match the current search.'}
                  </EmptyState>
                ) : null}

                {filteredSavedModels.length > 0 ? (
                  <SavedModelsList>
                    {filteredSavedModels.map((model) => {
                      const isRenaming = renamingModelName === model.name
                      const isActiveModel = activeSavedModelName === model.name

                      return (
                        <SavedModelItem key={model.name} $active={isActiveModel}>
                          <SavedModelHeader>
                            <SavedModelTitle>{model.name}</SavedModelTitle>
                            <SavedModelMeta>
                              {new Date(model.updatedAt).toLocaleString()}
                            </SavedModelMeta>
                          </SavedModelHeader>

                          <SavedModelMeta>
                            {model.voxels.length} voxel{model.voxels.length === 1 ? '' : 's'}
                            {isActiveModel ? ' · active' : ''}
                          </SavedModelMeta>

                          {isRenaming ? (
                            <InlineEditor>
                              <TextInput
                                size="small"
                                fullWidth
                                type="text"
                                value={renameDraftName}
                                onChange={(event) => setRenameDraftName(event.target.value)}
                              />
                              <InlineActions>
                                <SmallButton variant="contained" type="button" onClick={() => handleRenameSavedModel(model.name)}>
                                  Save name
                                </SmallButton>
                                <GhostButton
                                  variant="outlined"
                                  type="button"
                                  onClick={() => {
                                    setRenamingModelName(null)
                                    setRenameDraftName('')
                                  }}
                                >
                                  Cancel
                                </GhostButton>
                              </InlineActions>
                            </InlineEditor>
                          ) : (
                            <InlineActions>
                              <SmallButton variant="contained" type="button" onClick={() => handleLoadSavedModel(model.name)}>
                                Load
                              </SmallButton>
                              <GhostButton
                                variant="outlined"
                                type="button"
                                onClick={() => {
                                  setRenamingModelName(model.name)
                                  setRenameDraftName(model.name)
                                }}
                              >
                                Rename
                              </GhostButton>
                              <GhostButton variant="outlined" type="button" onClick={() => handleDeleteSavedModel(model.name)}>
                                Delete
                              </GhostButton>
                            </InlineActions>
                          )}
                        </SavedModelItem>
                      )
                    })}
                  </SavedModelsList>
                ) : null}
              </SavedModelsPanel>
            </SidebarSection>

            <SidebarSection>
              <SectionTitle>Usage notes</SectionTitle>
              <InfoList>
                <li>Ground clicks place voxels on the y=0 layer.</li>
                <li>Face clicks add the next voxel on the selected face normal.</li>
                <li>Orbit with drag; placement happens on click only.</li>
                <li>Invalid JSON keeps the current scene intact and shows an in-app error.</li>
                <li>Browser saves keep named models separate from the autosaved draft.</li>
              </InfoList>
            </SidebarSection>

            {statusMessage !== null ? <NoticeBanner aria-live="polite">{statusMessage}</NoticeBanner> : null}
            {persistenceError !== null ? <ErrorBanner aria-live="polite">{persistenceError}</ErrorBanner> : null}
            {loadError !== null ? <ErrorBanner aria-live="polite">{loadError}</ErrorBanner> : null}
          </SidebarScrollArea>

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
  height: 100dvh;
  display: flex;
  overflow: hidden;
  padding: 16px 20px 20px;
  background:
    radial-gradient(circle at top left, rgba(245, 132, 32, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(86, 137, 255, 0.16), transparent 22%),
    linear-gradient(180deg, #0f1821 0%, #091017 100%);
  color: #f5f7fb;

  @media (max-width: 720px) {
    padding: 12px;
  }
`

const ColorSwatch = styled.span`
  display: inline-flex;
  width: 40px;
  min-height: 40px;
  flex-shrink: 0;
  border-radius: 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
`

const ContentGrid = styled.section<{ $desktopCollapsed: boolean }>`
  display: grid;
  flex: 1;
  gap: 16px;
  min-height: 0;
  width: 100%;
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: 1080px) {
    align-items: stretch;
    grid-template-columns:
      minmax(0, 1fr)
      ${({ $desktopCollapsed }) =>
        $desktopCollapsed ? '0px' : 'minmax(320px, 360px)'};
    transition: grid-template-columns 220ms ease;
  }
`

const CanvasCard = styled.section`
  position: relative;
  min-width: 0;
  display: flex;
  min-height: 0;
`

const DesktopSidebarTrigger = styled(Button)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 4;
  display: none;
  align-items: center;
  min-height: 44px;
  background: rgba(10, 15, 23, 0.88);
  color: #eff4fb;

  @media (min-width: 1080px) {
    display: inline-flex;
  }
`

const ActionMenuToggle = styled(IconButton)`
  position: fixed;
  right: 14px;
  bottom: 14px;
  z-index: 24;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0;
  background: rgba(10, 15, 23, 0.92);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.36);
  color: #eff4fb;

  @media (min-width: 1080px) {
    display: none;
  }
`

const ActionMenuBackdrop = styled.button<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 22;
  border: 0;
  background: rgba(6, 10, 16, 0.44);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity 180ms ease;

  @media (min-width: 1080px) {
    display: none;
  }
`

const CanvasFrame = styled.div`
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 15, 23, 0.82);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);

  canvas {
    display: block;
  }

  @media (max-width: 1079px) {
    min-height: clamp(320px, 52vh, 620px);
  }
`

const SidebarCard = styled(Paper)<{ $desktopCollapsed: boolean; $open: boolean }>`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  height: 100%;
  min-height: 0;
  border-radius: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 15, 23, 0.78);
  backdrop-filter: blur(14px);
  overflow: hidden;

  @media (max-width: 1079px) {
    position: fixed;
    right: 12px;
    bottom: 78px;
    left: 12px;
    z-index: 23;
    max-height: calc(100dvh - 120px);
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
    transform: translateY(${({ $open }) => ($open ? '0' : '18px')});
    transition: opacity 180ms ease, transform 180ms ease;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
  }

  @media (min-width: 1080px) {
    position: static;
    max-height: none;
    opacity: ${({ $desktopCollapsed }) => ($desktopCollapsed ? 0 : 1)};
    overflow: hidden;
    pointer-events: ${({ $desktopCollapsed }) => ($desktopCollapsed ? 'none' : 'auto')};
    transform: translateX(${({ $desktopCollapsed }) => ($desktopCollapsed ? '24px' : '0')});
    transition: opacity 220ms ease, transform 220ms ease;
  }
`

const SidebarHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const SidebarHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const SidebarEyebrow = styled.p`
  margin: 0 0 4px;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9fb1c8;
`

const SidebarTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
`

const SidebarScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 0 20px 20px;
`

const SidebarSection = styled.section`
  display: grid;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  &:first-of-type {
    padding-top: 0;
    border-top: 0;
  }
`

const SceneFacts = styled.div`
  display: grid;
  gap: 10px;
`

const SceneFact = styled.div`
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);

  span {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #90a1b6;
  }

  strong {
    font-size: 0.95rem;
    font-weight: 700;
  }
`

const ToolToggleGroup = styled(ToggleButtonGroup)`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  .MuiToggleButtonGroup-grouped {
    margin: 0;
    border-radius: 0;
  }
`

const ToolToggleButton = styled(ToggleButton)`
  min-height: 44px;
  color: #eff4fb;

  &.Mui-selected {
    color: #ffe5bf;
    background: rgba(245, 159, 69, 0.16);
  }
`

const ColorField = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ColorInput = styled.input`
  width: 56px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
`

const CollapseButton = styled(IconButton)`
  color: #9fb1c8;

  @media (min-width: 1080px) {
    display: none;
  }
`

const DesktopHeaderButton = styled(Button)`
  display: none;
  color: #9fb1c8;

  @media (min-width: 1080px) {
    display: inline-flex;
  }
`

const SavedModelsPanel = styled.div`
  display: grid;
  gap: 12px;
`

const FieldRow = styled.label`
  display: grid;
  gap: 8px;
`

const FieldLabel = styled.span`
  font-size: 0.86rem;
  color: #c8d4e4;
`

const TextInput = styled(TextField)`
  .MuiOutlinedInput-root {
    background: rgba(255, 255, 255, 0.05);
  }
`

const MutedText = styled.p`
  margin: 0;
  color: #9fb1c8;
  line-height: 1.5;
`

const EmptyState = styled.p`
  margin: 0;
  padding: 14px 16px;
  border-radius: 0;
  color: #b8c3d6;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.12);
`

const SavedModelsList = styled.div`
  display: grid;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
`

const SavedModelItem = styled.article<{ $active: boolean }>`
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 0;
  background: ${({ $active }) =>
    $active ? 'rgba(245, 159, 69, 0.14)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(245, 159, 69, 0.28)' : 'rgba(255, 255, 255, 0.08)')};
`

const SavedModelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`

const SavedModelTitle = styled.strong`
  font-size: 1rem;
`

const SavedModelMeta = styled.span`
  color: #9fb1c8;
  font-size: 0.85rem;
`

const InlineEditor = styled.div`
  display: grid;
  gap: 10px;
`

const InlineActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const SmallButton = styled(Button)`
  min-height: 36px;
  color: #081018;
  background: linear-gradient(135deg, #f59f45 0%, #ffce72 100%);
`

const GhostButton = styled(Button)`
  min-height: 36px;
  color: #eff4fb;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const ActionGroup = styled.div`
  display: grid;
  gap: 12px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const ActionButton = styled(Button)`
  min-height: 48px;
  color: #081018;
  background: linear-gradient(135deg, #f59f45 0%, #ffce72 100%);
`

const SecondaryButton = styled(ActionButton)`
  color: #eff4fb;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);

  &.Mui-disabled {
    opacity: 0.45;
    color: rgba(239, 244, 251, 0.52);
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
  border-radius: 0;
  color: #ffe5bf;
  background: rgba(245, 159, 69, 0.14);
  border: 1px solid rgba(245, 159, 69, 0.28);
`

const ErrorBanner = styled.p`
  margin: 0;
  padding: 14px 16px;
  border-radius: 0;
  color: #ffd5d1;
  background: rgba(198, 49, 49, 0.16);
  border: 1px solid rgba(198, 49, 49, 0.34);
`

const HiddenInput = styled.input`
  display: none;
`
