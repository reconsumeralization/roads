'use client'

import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface RoadIssue {
  type: '🕳️ Pothole' | '↔️ Crack' | '〰️ Bumpy'
  severity: 'mild' | 'watch' | 'fix'
  emoji: string
  message: string
  funFact: string
}

const FunRoadAnalyzer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [issues, setIssues] = useState<RoadIssue[]>([])
  const [showFunFact, setShowFunFact] = useState(false)

  const funFacts = {
    pothole:
      "Did you know? The world's most famous pothole was in Pittsburgh - it was so deep people threw a birthday party for it! 🎂",
    crack:
      "Fun fact: If all road cracks in the US were lined up, they could reach Mars! Well, maybe not, but that's a lot of cracks! 🚀",
    bumpy:
      "Interesting: Some roads are intentionally made bumpy to keep drivers alert! Though yours probably shouldn't be... 😅",
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setImage(img)
          createFunVisualization(img)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const createFunVisualization = async (img: HTMLImageElement) => {
    setIsAnalyzing(true)

    // Create a fun 3D scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f9ff) // Light blue background

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

    // Create a wavy road surface
    const geometry = new THREE.PlaneGeometry(10, 10, 50, 50)
    const vertices = geometry.attributes.position.array
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.sin(vertices[i] / 2) * 0.2
    }
    geometry.attributes.position.needsUpdate = true

    // Create a fun material with the uploaded image
    const texture = new THREE.TextureLoader().load(img.src)
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.2,
      shininess: 50,
    })

    const plane = new THREE.Mesh(geometry, material)
    plane.rotation.x = -Math.PI / 4
    scene.add(plane)

    // Add some fun lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const spotLight = new THREE.SpotLight(0xffa95c, 4)
    spotLight.position.set(5, 5, 5)
    spotLight.castShadow = true
    scene.add(spotLight)

    // Add some decorative elements
    const roadSigns = [
      { position: [-2, 0, 1], emoji: '🚧' },
      { position: [2, 0, -1], emoji: '🚸' },
      { position: [0, 0, 2], emoji: '⚠️' },
    ]

    roadSigns.forEach((sign) => {
      const signGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1)
      const signMaterial = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        emissive: 0x666600,
      })
      const signMesh = new THREE.Mesh(signGeometry, signMaterial)
      signMesh.position.set(...sign.position)
      scene.add(signMesh)
    })

    camera.position.z = 15
    camera.position.y = 5

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Fun animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Make the road "breathe" slightly
      const time = Date.now() * 0.001
      plane.position.y = Math.sin(time) * 0.1

      // Rotate the signs
      roadSigns.forEach((_, index) => {
        const sign = scene.children[index + 3] // Offset for other scene objects
        if (sign) {
          sign.rotation.y = time * (index + 1) * 0.2
        }
      })

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Generate some fun "analysis"
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const funIssues: RoadIssue[] = [
      {
        type: '🕳️ Pothole',
        severity: 'watch',
        emoji: '👀',
        message: "There's a pothole having a party here!",
        funFact: funFacts.pothole,
      },
      {
        type: '↔️ Crack',
        severity: 'mild',
        emoji: '🤏',
        message: 'Just a tiny crack playing hide and seek',
        funFact: funFacts.crack,
      },
      {
        type: '〰️ Bumpy',
        severity: 'fix',
        emoji: '🎢',
        message: "This road thinks it's a roller coaster!",
        funFact: funFacts.bumpy,
      },
    ]

    setIssues(funIssues)
    setIsAnalyzing(false)
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🛣️ Road Surface Explorer 🔍
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Fun Upload Section */}
            <div className="rounded-xl bg-white/50 p-6 backdrop-blur-sm">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer rounded-xl border-4 border-dashed border-blue-200 bg-white p-8 shadow-lg transition-colors hover:border-blue-400"
                >
                  <div className="mb-4 text-center text-6xl">📸</div>
                  <p className="text-center text-lg text-gray-600">
                    Drop your road photo here!
                  </p>
                  <p className="mt-2 text-center text-sm text-gray-400">
                    Let's see what we can discover...
                  </p>
                </motion.div>
              </label>
            </div>

            {/* Fun 3D Preview & Results */}
            {image && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="relative h-[400px] overflow-hidden rounded-xl bg-white/50 backdrop-blur-sm">
                  <canvas ref={canvasRef} className="h-full w-full" />
                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                    >
                      <div className="text-xl text-white">
                        🔍 Investigating your road...
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-700">
                    Road Report 📝
                  </h3>
                  <AnimatePresence>
                    {issues.map((issue, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.2 }}
                        className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{issue.emoji}</span>
                          <div>
                            <h4 className="font-semibold">{issue.type}</h4>
                            <p className="text-gray-600">{issue.message}</p>
                            <motion.button
                              onClick={() => setShowFunFact(!showFunFact)}
                              className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                            >
                              🎈 Fun fact!
                            </motion.button>
                            <AnimatePresence>
                              {showFunFact && (
                                <motion.p
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-2 text-sm text-gray-500"
                                >
                                  {issue.funFact}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FunRoadAnalyzer
