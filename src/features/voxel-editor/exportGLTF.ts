import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type Material,
  type Object3D,
} from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import type { Voxel } from './types'

function disposeMaterial(material: Material) {
  for (const value of Object.values(material as unknown as Record<string, unknown>)) {
    if (
      typeof value === 'object' &&
      value !== null &&
      'isTexture' in value &&
      'dispose' in value &&
      value.isTexture === true &&
      typeof value.dispose === 'function'
    ) {
      value.dispose()
    }
  }

  material.dispose()
}

function disposeValidationScene(root: Object3D) {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) {
      return
    }

    node.geometry.dispose()

    if (Array.isArray(node.material)) {
      node.material.forEach(disposeMaterial)
      return
    }

    disposeMaterial(node.material)
  })
}

function validateGlb(arrayBuffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()

    loader.parse(
      arrayBuffer,
      '',
      (gltf) => {
        disposeValidationScene(gltf.scene)
        resolve()
      },
      (error) => {
        reject(error instanceof Error ? error : new Error('Unable to validate the exported GLB file.'))
      },
    )
  })
}

export async function exportVoxelsToGlb(voxels: Voxel[]): Promise<Blob> {
  if (voxels.length === 0) {
    throw new Error('Add at least one voxel before exporting a GLB file.')
  }

  const root = new Group()
  const geometry = new BoxGeometry(1, 1, 1)
  const materials = new Map<string, MeshStandardMaterial>()

  for (const voxel of voxels) {
    let material = materials.get(voxel.color)

    if (material === undefined) {
      material = new MeshStandardMaterial({ color: voxel.color, flatShading: true })
      materials.set(voxel.color, material)
    }

    const mesh = new Mesh(geometry, material)
    mesh.position.set(voxel.x, voxel.y, voxel.z)
    root.add(mesh)
  }

  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const exporter = new GLTFExporter()

    exporter.parse(
      root,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result)
          return
        }

        reject(new Error('Expected binary GLB export output.'))
      },
      (error) => {
        reject(error instanceof Error ? error : new Error('Failed to export the voxel scene.'))
      },
      { binary: true, onlyVisible: true },
    )
  })

  try {
    await validateGlb(arrayBuffer)
    return new Blob([arrayBuffer], { type: 'model/gltf-binary' })
  } finally {
    root.clear()
    geometry.dispose()
    materials.forEach((material) => material.dispose())
  }
}
