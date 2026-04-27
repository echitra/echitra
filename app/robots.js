export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://echitra.vercel.app/sitemap.xml',
  }
}