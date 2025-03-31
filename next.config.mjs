/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    basePath: "/hospital",
    assetPrefix: "/hospital",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
