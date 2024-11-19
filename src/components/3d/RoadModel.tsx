'use client'

import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

export function RoadModel() {
  const roadTexture = useLoader(TextureLoader, '/textures/road.jpg')

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[20, 10]} />
      <meshStandardMaterial map={roadTexture} roughness={0.8} />
    </mesh>
  )
}
