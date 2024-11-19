'use client'

import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface SimpleDefect {
  type: 'minor' | 'moderate' | 'severe'
  location: string
  recommendation: string
}

const SimpleRoadAnalyzer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [defects, setDefects] = useState<SimpleDefect[]>([])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setImage(img)
          analyzeImage(img)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async (img: HTMLImageElement) => {
    setIsAnalyzing(true)

    // Create a simple visualization
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    if (!canvasRef.current) return
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    })

    // Create a texture from the image
    const texture = new THREE.TextureLoader().load(img.src)
    const geometry = new THREE.PlaneGeometry(10, 10)
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.1,
    })

    const plane = new THREE.Mesh(geometry, material)
    scene.add(plane)

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(0, 5, 5)
    scene.add(light)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    camera.position.z = 8

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // Simple animation
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Simulate analysis with simple results
    const sampleDefects: SimpleDefect[] = [
      {
        type: 'minor',
        location: 'Upper section',
        recommendation: 'Monitor for changes',
      },
      {
        type: 'moderate',
        location: 'Center area',
        recommendation: 'Schedule repair within 3 months',
      },
    ]

    setDefects(sampleDefects)
    setIsAnalyzing(false)
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Road Surface Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <div className="cursor-pointer">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 shadow-sm"
                  >
                    <div className="mb-2 text-4xl">📸</div>
                    <p className="text-gray-600">
                      Upload a photo of your road surface
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      Click or drag an image here
                    </p>
                  </motion.div>
                </div>
              </label>
            </div>

            {/* Preview and Results */}
            {image && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 3D Preview */}
                <div className="relative h-[300px] overflow-hidden rounded-lg bg-gray-100">
                  <canvas ref={canvasRef} className="h-full w-full" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-white">Analyzing surface...</div>
                    </div>
                  )}
                </div>

                {/* Simple Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Analysis</h3>
                  {defects.map((defect, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className={`rounded-lg p-4 ${
                        defect.type === 'severe'
                          ? 'bg-red-50'
                          : defect.type === 'moderate'
                            ? 'bg-yellow-50'
                            : 'bg-green-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>
                          {defect.type === 'severe'
                            ? '🔴'
                            : defect.type === 'moderate'
                              ? '🟡'
                              : '🟢'}
                        </span>
                        <div>
                          <p className="font-medium">{defect.location}</p>
                          <p className="text-sm text-gray-600">
                            {defect.recommendation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SimpleRoadAnalyzer
