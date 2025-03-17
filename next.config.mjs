/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/hospital",
    assetPrefix: '/hospital',
    output: "export",
    images: {
        unoptimized: true
    }
};

export default nextConfig;
