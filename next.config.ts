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
  // Allow the preview host to reach Next.js dev resources so client hydration
  // and hot reload work when the demo is opened through the preview URL.
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    'pv-c334514c3706-ef5fea27-9469-45b8-becd-57f84675fe8c.style.dev',
  ],
}

export default nextConfig
