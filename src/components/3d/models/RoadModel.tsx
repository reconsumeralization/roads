import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'

export function RoadModel({ viewMode }) {
  const { scene, materials } = useGLTF('/models/road.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  return (
    <primitive
      object={scene}
      position={viewMode === 'aerial' ? [0, 10, 0] : [0, 0, 0]}
      rotation={viewMode === 'aerial' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
    />
  )
}

export function ParkingLotModel({ viewMode }) {
  const { scene, materials } = useGLTF('/models/parking.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  return (
    <primitive
      object={scene}
      position={viewMode === 'aerial' ? [0, 10, 0] : [0, 0, 0]}
      rotation={viewMode === 'aerial' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
    />
  )
}

export function PrivateRoadModel({ viewMode }) {
  const { scene, materials } = useGLTF('/models/private-road.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  return (
    <primitive
      object={scene}
      position={viewMode === 'aerial' ? [0, 10, 0] : [0, 0, 0]}
      rotation={viewMode === 'aerial' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
    />
  )
}
