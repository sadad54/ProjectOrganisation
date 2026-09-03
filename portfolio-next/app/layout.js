import './globals.css';

export const viewport = {
  themeColor: '#0B0B0D',
};

export const metadata = {
  title: 'Adnan Mashrur Sadad - AI & Software Engineer',
  description: 'AI and software engineer in Kuala Lumpur. I build LLM systems that check their own work.',
  openGraph: {
    title: 'Adnan Mashrur Sadad - AI & Software Engineer',
    description: 'I build LLM systems that check their own work.',
    type: 'website'
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230B0B0D'/><text y='68' x='50' text-anchor='middle' font-size='52' font-family='monospace' font-weight='700' fill='%23FF6A3D'>A</text></svg>"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Pre-hydration: mark JS available, and re-apply a stored reduced-motion
            override before first paint so it never flashes. The inline script
            mutates <html>'s className before React hydrates, so the root element
            is exempted from hydration attribute diffing. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');try{if(localStorage.getItem('rm')==='1')document.documentElement.classList.add('rm')}catch(e){}",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Archivo:wght@600;700&family=Abril+Fatface&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
