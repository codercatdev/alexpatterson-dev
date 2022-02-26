/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'cloudinary',
    path: 'https://media.codingcat.dev/image/upload/',
  },
};

module.exports = nextConfig;
