/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  env: {
    SENSORNET_URL: process.env.SENSORNET_URL
  }
}

export default nextConfig;
