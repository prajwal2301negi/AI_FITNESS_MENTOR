import './globals.css'

export const metadata = {
  title: 'FitMentor AI',
  description: 'Your AI-powered fitness and diet mentor',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
