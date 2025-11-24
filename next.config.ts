import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack workspace root 경고 억제(상위 lockfile이 있을 때)
    turbo: {
      resolveAlias: {},
    },
    turbopack: {
      // Next 16 문서 기준: root 설정 가능. 문제가 있으면 안전하게 주석처리 가능.
      // @ts-ignore
      root: __dirname,
    },
  },
}

export default nextConfig