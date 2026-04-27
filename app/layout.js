export const metadata = {
  title: {
    default: 'Echitra',
    template: '%s | Echitra',
  },
  description: 'Echitra – Your ultimate destination for movies, series, reviews, and cinematic stories from around the world.',
  keywords: ['movies', 'series', 'film reviews', 'watch online', 'cinema', 'Echitra'],
  authors: [{ name: 'Echitra' }],
  creator: 'Echitra',
  metadataBase: new URL('https://echitra.vercel.app'),

  verification: {
    google: '95ih9kjZ9c9s_jzhL5Fo_p4OqYsPvkYFpC7emOye9Pc',
  },

  openGraph: {
    title: 'Echitra',
    description: 'Watch movies and series on Echitra – your go-to destination for cinema.',
    url: 'https://echitra.vercel.app',
    siteName: 'Echitra',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Echitra – Movies & Series' }],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Echitra',
    description: 'Watch movies and series on Echitra – your go-to destination for cinema.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}