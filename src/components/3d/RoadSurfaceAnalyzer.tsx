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

interface RoadDefect {
  type: 'crack' | 'pothole' | 'rutting' | 'raveling' | 'bleeding'
  severity: number
  position: [number, number, number]
  area?: number // For measuring defect size
  depth?: number // For potholes
  width?: number // For cracks
  length?: number // For cracks and ruts
}

interface AnalysisSettings {
  sensitivity: number
  highlightDefects: boolean
  exaggerateDepth: number
  showMeasurements: boolean
  colorizeByType: boolean
  defectThreshold: number
  minimumDefectSize: number
}

const RoadSurfaceAnalyzer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [defects, setDefects] = useState<RoadDefect[]>([])
  const [analysisReport, setAnalysisReport] = useState<string>('')
  const [settings, setSettings] = useState<AnalysisSettings>({
    sensitivity: 1.5,
    highlightDefects: true,
    exaggerateDepth: 2,
    showMeasurements: true,
    colorizeByType: true,
    defectThreshold: 0.3,
    minimumDefectSize: 10, // minimum size in pixels to be considered a defect
  })

  const analyzeRoadSurface = (imageData: ImageData) => {
    const detectedDefects: RoadDefect[] = []
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height

    // Enhanced surface analysis
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        const surrounding = getSurroundingPixels(data, idx, width)
        const { defectType, severity } = analyzePixelPattern(surrounding)

        if (severity > settings.defectThreshold) {
          const defectSize = measureDefectSize(data, x, y, width, height)

          if (defectSize > settings.minimumDefectSize) {
            detectedDefects.push({
              type: defectType,
              severity,
              position: [x - width / 2, 0, y - height / 2],
              area: defectSize,
              depth: calculateDefectDepth(surrounding),
              width: calculateDefectWidth(data, x, y, width),
              length: calculateDefectLength(data, x, y, width, height),
            })
          }
        }
      }
    }

    generateAnalysisReport(detectedDefects)
    return detectedDefects
  }

  const getSurroundingPixels = (
    data: Uint8ClampedArray,
    centerIdx: number,
    width: number
  ) => {
    return {
      top: getPixelIntensity(data, centerIdx - width * 4),
      bottom: getPixelIntensity(data, centerIdx + width * 4),
      left: getPixelIntensity(data, centerIdx - 4),
      right: getPixelIntensity(data, centerIdx + 4),
      topLeft: getPixelIntensity(data, centerIdx - width * 4 - 4),
      topRight: getPixelIntensity(data, centerIdx - width * 4 + 4),
      bottomLeft: getPixelIntensity(data, centerIdx + width * 4 - 4),
      bottomRight: getPixelIntensity(data, centerIdx + width * 4 + 4),
    }
  }

  const analyzePixelPattern = (
    surrounding: any
  ): { defectType: RoadDefect['type']; severity: number } => {
    const variance = calculateVariance(Object.values(surrounding))
    const gradient = calculateGradient(surrounding)
    const pattern = detectPattern(surrounding)

    if (pattern.isPothole) {
      return { defectType: 'pothole', severity: pattern.severity }
    } else if (pattern.isCrack) {
      return { defectType: 'crack', severity: pattern.severity }
    } else if (pattern.isRutting) {
      return { defectType: 'rutting', severity: pattern.severity }
    } else if (pattern.isRaveling) {
      return { defectType: 'raveling', severity: pattern.severity }
    } else if (pattern.isBleeding) {
      return { defectType: 'bleeding', severity: pattern.severity }
    }

    return { defectType: 'crack', severity: 0 }
  }

  const getDefectColor = (
    type: RoadDefect['type'],
    severity: number
  ): THREE.Color => {
    const baseColors = {
      pothole: new THREE.Color(1, 0, 0), // Red
      crack: new THREE.Color(1, 1, 0), // Yellow
      rutting: new THREE.Color(0, 1, 0), // Green
      raveling: new THREE.Color(0, 0, 1), // Blue
      bleeding: new THREE.Color(1, 0, 1), // Purple
    }

    const color = baseColors[type].clone()
    // Adjust color based on severity
    color.multiplyScalar(severity)
    return color
  }

  const createVisualization = (defects: RoadDefect[], imageData: ImageData) => {
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    })

    // Create surface geometry with defects
    const geometry = new THREE.PlaneGeometry(100, 100, 199, 199)
    const vertices = geometry.attributes.position.array
    const colors = new Float32Array(vertices.length)

    // Apply defect information to geometry
    defects.forEach((defect) => {
      const { position, severity, type } = defect
      const vertexIndex = getClosestVertexIndex(position, vertices)

      // Modify vertex height based on defect type and severity
      vertices[vertexIndex + 1] = -severity * settings.exaggerateDepth

      // Color based on defect type if enabled
      if (settings.colorizeByType) {
        const color = getDefectColor(type, severity)
        colors[vertexIndex] = color.r
        colors[vertexIndex + 1] = color.g
        colors[vertexIndex + 2] = color.b
      }

      // Add measurement annotations if enabled
      if (settings.showMeasurements) {
        addMeasurementAnnotation(scene, defect)
      }
    })

    // ... rest of the visualization code ...
  }

  // ... rest of the component implementation ...

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Road Surface Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ... existing UI components ... */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {/* ... existing controls ... */}
              <div className="mb-4">
                <Label>Minimum Defect Size</Label>
                <Slider
                  value={[settings.minimumDefectSize]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, minimumDefectSize: value })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              {analysisReport && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold">Analysis Report</h3>
                  <pre className="whitespace-pre-wrap text-sm">
                    {analysisReport}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ... rest of the UI ... */}
    </div>
  )
}

export default RoadSurfaceAnalyzer
