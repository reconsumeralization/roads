'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Environment, OrbitControls } from '@react-three/drei'
import { RoadModel } from './RoadModel'
import { Construction } from './Construction'
import { NavLinks } from './NavLinks'

export function RoadCrewScene() {
  return (
    <div className="h-[40vh] w-full">
      <Canvas camera={{ position: [0, 5, 10], fov: 45 }} shadows>
        <Suspense fallback={null}>
          {/* Main scene lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

          {/* Road and construction elements */}
          <RoadModel />
          <Construction />

          {/* Interactive nav links positioned in 3D space */}
          <NavLinks />

          {/* Environment and controls */}
          <Environment preset="city" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
