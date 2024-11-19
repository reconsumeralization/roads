export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Construction Site</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Our Services</h2>
          <ul className="space-y-2">
            <li>Concrete Work</li>
            <li>Foundation</li>
            <li>Driveways</li>
            <li>Patios</li>
          </ul>
        </section>

        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
          <p>Check out our latest construction projects and success stories.</p>
        </section>

        <section className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>Get in touch for a free quote on your next project.</p>
        </section>
      </div>
    </main>
  )
}
