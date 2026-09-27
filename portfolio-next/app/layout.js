import './styles/tokens.css';
import './styles/base.css';
import './styles/chrome.css';
import './styles/hero.css';
import './styles/about.css';
import './styles/decisions.css';
import './styles/work.css';
import './styles/research.css';
import './styles/weights.css';
import './styles/contact.css';
import './styles/project.css';
import Providers from './components/site/Providers';

export const viewport = {
  themeColor: '#050608',
};

export const metadata = {
  title: 'Adnan Mashrur Sadad — AI & Software Engineer',
  description:
    'AI and software engineer in Kuala Lumpur. I build LLM systems that check their own work — validation, repair loops, eval harnesses, and deployments that actually run.',
  openGraph: {
    title: 'Adnan Mashrur Sadad — AI & Software Engineer',
    description: 'I build LLM systems that check their own work.',
    type: 'website',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='%23050608'/><path d='M14 44 L32 18 L50 44 M14 44 H50' stroke='%23FF6B3D' stroke-width='3' fill='none'/><circle cx='14' cy='44' r='5' fill='%23FF6B3D'/><circle cx='32' cy='18' r='5' fill='%23EEEBE4'/><circle cx='50' cy='44' r='5' fill='%23FF6B3D'/></svg>",
  },
};

/* Runs before first paint:
   - `js`   — reveal styles only ever hide content once JS is known to run
   - `rm`   — the manual reduced-motion override from ⌘K, restored pre-paint
   - `boot` — first visit this session, on the index, motion allowed → the
              preloader covers the page from the very first frame */
const PREPAINT =
  "var d=document.documentElement;d.classList.add('js');" +
  "try{if(localStorage.getItem('rm')==='1')d.classList.add('rm')}catch(e){}" +
  "try{if(location.pathname==='/'&&!sessionStorage.getItem('booted')&&!d.classList.contains('rm')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('boot')}catch(e){}";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
