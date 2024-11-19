'use client'

import { useState } from 'react'
import RoadVisualizer from '@/components/3d/RoadVisualizer'
import RenderControls from '@/components/3d/RenderControls'

export default function VisualizerPage() {
  const [quality, setQuality] = useState(3)
  const [lighting, setLighting] = useState('day')
  const [materials, setMaterials] = useState('asphalt')

  const handleRender = async () => {
    // Implement render generation logic
    console.log('Generating render with:', { quality, lighting, materials })
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Project Visualizer</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <RoadVisualizer />
        </div>
        <div>
          <RenderControls
            quality={quality}
            setQuality={setQuality}
            lighting={lighting}
            setLighting={setLighting}
            materials={materials}
            setMaterials={setMaterials}
            onRender={handleRender}
          />
        </div>
      </div>
    </div>
  )
}
