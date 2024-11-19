import { loadEnvConfig } from '@next/env'

// Load test environment variables
export default async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)

  // Set test-specific environment variables
  process.env.LOG_LEVEL = 'debug'
  process.env.NODE_ENV = 'test'
}
