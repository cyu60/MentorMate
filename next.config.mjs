import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "clinicalmindai.stanford.edu",
      
    ],
  },
};

const config = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);

export default config;
