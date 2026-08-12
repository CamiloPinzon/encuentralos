import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://encuentralos-seven.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/gestionar/', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
