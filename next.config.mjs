/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    basePath: "/hospital",
    assetPrefix: "/hospital",
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
