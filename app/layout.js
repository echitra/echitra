import './globals.css'

export const metadata = {
  title: {
    default: 'Echitra',
    template: '%s | Echitra',
  },
  description: 'Echitra – Your ultimate destination for movies, series, reviews, and cinematic stories from around the world.',
  verification: {
    google: '95ih9kjZ9c9s_jzhL5Fo_p4OqYsPvkYFpC7emOye9Pc',
  },
  metadataBase: new URL('https://echitra.vercel.app'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
