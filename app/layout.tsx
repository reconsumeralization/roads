import { RoadCrewScene } from '@/components/3d/RoadCrewScene'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <RoadCrewScene />
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
