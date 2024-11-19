import { notFound } from 'next/navigation'

async function getProjects() {
  try {
    // Simulated async data fetch
    const projects = [
      { id: 1, title: 'Downtown Plaza', status: 'Completed' },
      { id: 2, title: 'Residential Complex', status: 'In Progress' },
      { id: 3, title: 'Commercial Center', status: 'Planning' }
    ]
    return projects
  } catch (error) {
    throw new Error('Failed to fetch projects')
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  if (!projects.length) {
    notFound()
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Our Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{project.title}</h2>
            <p className="text-gray-600">Status: {project.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
