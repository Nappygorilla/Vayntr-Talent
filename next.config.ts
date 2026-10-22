import type { NextConfig } from 'next'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig: NextConfig = {
  // GitHub Pages uses a static export under the repository path.
  // Other hosts can run the same code as a normal Next.js server.
  basePath: isGitHubPages ? '/Vayntr-Talent' : undefined,
  output: isGitHubPages ? 'export' : undefined,
  trailingSlash: isGitHubPages,
  images: {
    unoptimized: isGitHubPages,
  },
}

export default nextConfig
