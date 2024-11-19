'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function Construction() {
  const constructionRef = useRef()
  const { nodes, materials } = useGLTF('/models/construction.glb')

  useFrame((state) => {
    // Add subtle animation to construction elements
    const t = state.clock.getElapsedTime()
    constructionRef.current.position.y = Math.sin(t) * 0.1 + 0.1
  })

  return (
    <group ref={constructionRef}>
      {/* Construction worker models and equipment */}
      <mesh
        castShadow
        geometry={nodes.worker.geometry}
        material={materials.worker}
        position={[-2, 0, 0]}
      />
      {/* Add more construction elements here */}
    </group>
  )
}
