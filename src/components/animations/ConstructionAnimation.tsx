import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ConstructionAnimation() {
  const [isAnimating, setIsAnimating] = useState(true)

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-100 to-white shadow-lg">
      <motion.svg
        viewBox="0 0 1000 500"
        className="h-full w-full"
        initial="hidden"
        animate="visible"
      >
        {/* Ground */}
        <motion.rect
          x="0"
          y="300"
          width="1000"
          height="200"
          fill="#8B4513"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Road Base Layer */}
        <motion.path
          d="M 50 350 Q 500 350 950 350"
          stroke="#333"
          strokeWidth="80"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        />

        {/* Asphalt Texture */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          {Array.from({ length: 50 }).map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 900 + 50}
              cy={Math.random() * 40 + 330}
              r={Math.random() * 2}
              fill="#222"
            />
          ))}
        </motion.g>

        {/* Construction Equipment */}
        <motion.g
          initial={{ x: -100 }}
          animate={{
            x: isAnimating ? [0, 800, 0] : 0,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          {/* Steamroller */}
          <motion.g transform="translate(0,320) scale(0.5)">
            <rect width="100" height="50" fill="#FFD700" />
            <circle cx="20" cy="50" r="20" fill="#333" />
            <circle cx="80" cy="50" r="20" fill="#333" />
            <rect x="30" y="10" width="40" height="20" fill="#333" />
          </motion.g>
        </motion.g>

        {/* Road Markers Animation */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.rect
              key={i}
              x={100 + i * 100}
              y="348"
              width="40"
              height="4"
              fill="white"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 3.5 + i * 0.1 }}
            />
          ))}
        </motion.g>

        {/* Progress Indicators */}
        <motion.g>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={200 + i * 300}
              cy="250"
              r="15"
              fill="#22C55E"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 1 }}
            >
              <motion.text
                x={200 + i * 300}
                y="255"
                textAnchor="middle"
                fill="white"
                fontSize="20"
              >
                ✓
              </motion.text>
            </motion.circle>
          ))}
        </motion.g>
      </motion.svg>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 space-x-2">
        <motion.button
          className="rounded-lg bg-blue-500 px-4 py-2 text-white shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAnimating(!isAnimating)}
        >
          {isAnimating ? '⏸️ Pause' : '▶️ Play'}
        </motion.button>
      </div>
    </div>
  )
}
