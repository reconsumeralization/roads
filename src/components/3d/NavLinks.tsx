'use client'

import { Text } from '@react-three/drei'
import { useRouter } from 'next/navigation'

export function NavLinks() {
  const router = useRouter()

  const links = [
    { text: 'Home', path: '/', position: [-4, 2, 0] },
    { text: 'Projects', path: '/projects', position: [-1, 2, 0] },
    { text: 'Contact', path: '/contact', position: [2, 2, 0] },
  ]

  return (
    <group>
      {links.map((link) => (
        <Text
          key={link.path}
          position={link.position}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          onClick={() => router.push(link.path)}
          onPointerOver={(e) => {
            document.body.style.cursor = 'pointer'
            e.object.scale.set(1.2, 1.2, 1.2)
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'default'
            e.object.scale.set(1, 1, 1)
          }}
        >
          {link.text}
        </Text>
      ))}
    </group>
  )
}
