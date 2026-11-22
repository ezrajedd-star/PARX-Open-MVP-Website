import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Placeholder artwork is SVG; real photos should be JPG/PNG/WebP.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  poweredByHeader: false,
  // Fonts used by the generated Open Graph images.
  outputFileTracingIncludes: { "/**": ["./assets/fonts/**", "./content/**", "./public/brand/**"] },
};

export default nextConfig;
