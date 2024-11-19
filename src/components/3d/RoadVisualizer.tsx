import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  ContactShadows,
  AccumulativeShadows,
  RandomizedLight,
  Loader,
} from '@react-three/drei'
import { Suspense, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

export default function RoadVisualizer() {
  const [projectType, setProjectType] = useState('road')
  const [viewMode, setViewMode] = useState('3d')

  return (
    <div className="relative h-[80vh] w-full overflow-hidden rounded-xl bg-gradient-to-b from-blue-50 to-white shadow-2xl">
      <div className="absolute left-4 top-4 z-10 rounded-xl border border-gray-100 bg-white/90 p-6 shadow-lg backdrop-blur-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Project Type
        </h3>
        <RadioGroup value={projectType} onValueChange={setProjectType}>
          <div className="space-y-3">
            {[
              { value: 'road', label: 'Road Construction', icon: '🛣️' },
              { value: 'parking', label: 'Parking Lot', icon: '🅿️' },
              { value: 'private', label: 'Private Road', icon: '🏘️' },
            ].map(({ value, label, icon }) => (
              <motion.div
                key={value}
                className="flex items-center rounded-lg p-2 transition-colors hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RadioGroupItem value={value} id={value} />
                <Label htmlFor={value} className="ml-3 flex items-center gap-2">
                  <span>{icon}</span>
                  <span>{label}</span>
                </Label>
              </motion.div>
            ))}
          </div>
        </RadioGroup>

        <div className="mt-6 space-y-2">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            View Mode
          </h3>
          <div className="flex gap-2">
            {[
              { mode: '3d', icon: '🎮' },
              { mode: 'aerial', icon: '🛩️' },
            ].map(({ mode, icon }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'outline'}
                onClick={() => setViewMode(mode)}
                className="flex-1 py-6"
              >
                <span className="mr-2">{icon}</span>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />
        <Suspense fallback={null}>
          <Scene projectType={projectType} viewMode={viewMode} />
          <Environment preset="sunset" background blur={0.6} />
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.65}
            scale={40}
            blur={1}
            far={9}
          />
          <AccumulativeShadows
            temporal
            frames={100}
            alphaTest={0.85}
            opacity={0.8}
          >
            <RandomizedLight
              amount={8}
              radius={4}
              ambient={0.5}
              intensity={1}
              position={[5, 5, -10]}
            />
          </AccumulativeShadows>
          <OrbitControls
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            enableZoom={true}
            enablePan={true}
          />
        </Suspense>
      </Canvas>

      <Loader />

      <div className="absolute bottom-4 right-4 text-sm text-gray-500">
        Use mouse to rotate • Scroll to zoom • Shift + mouse to pan
      </div>
    </div>
  )
}

function Scene({ projectType, viewMode }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[-10, 10, -10]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />
      {projectType === 'road' && <RoadModel viewMode={viewMode} />}
      {projectType === 'parking' && <ParkingLotModel viewMode={viewMode} />}
      {projectType === 'private' && <PrivateRoadModel viewMode={viewMode} />}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <shadowMaterial transparent opacity={0.4} />
      </mesh>
    </>
  )
}
