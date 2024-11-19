import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

export default function RenderControls({
  onRender,
  quality,
  setQuality,
  lighting,
  setLighting,
  materials,
  setMaterials,
}) {
  return (
    <motion.div
      className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <Label className="mb-4 block text-lg font-semibold">
          Render Settings
        </Label>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block text-sm text-gray-600">
              Quality ({quality})
            </Label>
            <Slider
              value={[quality]}
              onValueChange={([value]) => setQuality(value)}
              min={1}
              max={5}
              step={1}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Draft</span>
              <span>High Quality</span>
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm text-gray-600">
              Time of Day
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {['day', 'sunset', 'night'].map((time) => (
                <Button
                  key={time}
                  variant={lighting === time ? 'default' : 'outline'}
                  onClick={() => setLighting(time)}
                  className="py-6"
                >
                  {time === 'day' && '☀️'}
                  {time === 'sunset' && '🌅'}
                  {time === 'night' && '🌙'}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm text-gray-600">
              Surface Material
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'asphalt', label: 'Asphalt', icon: '🛣️' },
                { id: 'concrete', label: 'Concrete', icon: '🏗️' },
              ].map(({ id, label, icon }) => (
                <Button
                  key={id}
                  variant={materials === id ? 'default' : 'outline'}
                  onClick={() => setMaterials(id)}
                  className="flex flex-col gap-2 py-6"
                >
                  <span>{icon}</span>
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button className="w-full py-6 text-lg font-semibold" onClick={onRender}>
        🎨 Generate Render
      </Button>
    </motion.div>
  )
}
