'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

interface RenderSettings {
  pointSize: number
  depthIntensity: number
  colorIntensity: number
  resolution: number
  showGrid: boolean
  rotationSpeed: number
}

const Quantized3DImageTransformer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const pointsRef = useRef<THREE.Points | null>(null)

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [settings, setSettings] = useState<RenderSettings>({
    pointSize: 0.5,
    depthIntensity: 1,
    colorIntensity: 1,
    resolution: 10,
    showGrid: true,
    rotationSpeed: 0.5,
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setImage(img)
          processImage(img, settings)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = (
    img: HTMLImageElement,
    currentSettings: RenderSettings
  ) => {
    if (!canvasRef.current) return
    setIsProcessing(true)

    // Create temporary canvas for image processing
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 1000
    tempCanvas.height = 1000
    const ctx = tempCanvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(img, 0, 0, 1000, 1000)
    const imageData = ctx.getImageData(0, 0, 1000, 1000)
    const data = imageData.data

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    })
    rendererRef.current = renderer

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)

    // Create point cloud
    const geometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const colors: number[] = []
    const { resolution, depthIntensity } = currentSettings

    for (let y = 0; y < 1000; y += resolution) {
      for (let x = 0; x < 1000; x += resolution) {
        let avgDepth = 0
        let avgR = 0,
          avgG = 0,
          avgB = 0

        // Calculate averages for the current block
        for (let dy = 0; dy < resolution; dy++) {
          for (let dx = 0; dx < resolution; dx++) {
            const i = ((y + dy) * 1000 + (x + dx)) * 4
            avgR += data[i]
            avgG += data[i + 1]
            avgB += data[i + 2]
            avgDepth += (data[i] + data[i + 1] + data[i + 2]) / 3
          }
        }

        const blockSize = resolution * resolution
        avgDepth = (avgDepth / blockSize) * depthIntensity
        avgR /= blockSize
        avgG /= blockSize
        avgB /= blockSize

        positions.push(x / 5 - 100, 100 - y / 5, avgDepth / 10)
        colors.push(avgR / 255, avgG / 255, avgB / 255)
      }
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      vertexColors: true,
      size: currentSettings.pointSize,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    })

    const points = new THREE.Points(geometry, material)
    pointsRef.current = points
    scene.add(points)

    // Add grid helper
    if (currentSettings.showGrid) {
      const gridHelper = new THREE.GridHelper(200, 20)
      gridHelper.position.y = -10
      scene.add(gridHelper)
    }

    // Add ambient and directional lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(10, 10, 10)
    scene.add(directionalLight)

    camera.position.z = 100

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.zoomSpeed = 0.5

    // Animation loop
    let frame: number
    const animate = () => {
      frame = requestAnimationFrame(animate)

      if (pointsRef.current && currentSettings.rotationSpeed > 0) {
        pointsRef.current.rotation.y += currentSettings.rotationSpeed * 0.01
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup function
    return () => {
      cancelAnimationFrame(frame)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }

    setIsProcessing(false)
  }

  // Update settings and reprocess image
  const updateSettings = (newSettings: Partial<RenderSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    if (image) {
      processImage(image, updatedSettings)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3D Image Transformer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Point Size</Label>
                <Slider
                  value={[settings.pointSize]}
                  min={0.1}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) =>
                    updateSettings({ pointSize: value })
                  }
                />
              </div>

              <div>
                <Label>Depth Intensity</Label>
                <Slider
                  value={[settings.depthIntensity]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onValueChange={([value]) =>
                    updateSettings({ depthIntensity: value })
                  }
                />
              </div>

              <div>
                <Label>Resolution</Label>
                <Slider
                  value={[settings.resolution]}
                  min={5}
                  max={20}
                  step={1}
                  onValueChange={([value]) =>
                    updateSettings({ resolution: value })
                  }
                />
              </div>

              <div>
                <Label>Rotation Speed</Label>
                <Slider
                  value={[settings.rotationSpeed]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) =>
                    updateSettings({ rotationSpeed: value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.showGrid}
                  onCheckedChange={(checked) =>
                    updateSettings({ showGrid: checked })
                  }
                />
                <Label>Show Grid</Label>
              </div>
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {image && (
                  <img
                    src={image.src}
                    alt="Preview"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                )}
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="h-[600px] w-full rounded-lg bg-gradient-to-b from-gray-900 to-gray-800"
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
            <div className="text-white">Processing...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quantized3DImageTransformer
