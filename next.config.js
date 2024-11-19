/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false
      }
    }
    return config
  },
  // Disable the deprecated stats output
  stats: {
    warningsFilter: [/the 'fs.Stats' API/]
  }
}

module.exports = nextConfig
