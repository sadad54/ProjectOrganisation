import { ImageResponse } from 'next/og';
import projects from '../../data/projects';

/* A share card per case study, drawn at build time from the same data the
   page reads: name, hook and headline number, on the site's ground and
   accent. (Colours are literals here: this runs outside the page's CSS.) */
export const alt = 'Case study by Adnan Mashrur Sadad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const p = projects[slug];
  const name = p?.name || 'Case study';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          color: '#EAF1F6',
          backgroundColor: '#02070A',
          backgroundImage: 'radial-gradient(900px 520px at 78% 0%, rgba(2,151,222,0.42), rgba(2,7,10,0)), radial-gradient(520px 320px at 70% 108%, rgba(255,106,43,0.42), rgba(2,7,10,0))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 5, textTransform: 'uppercase', color: '#9DA9B4' }}>
          <div style={{ display: 'flex' }}>
            <span style={{ color: '#FF6A2B', marginRight: 16 }}>Case study</span>
            <span>{p?.kind || ''}</span>
          </div>
          <span>{p?.year ? String(p.year) : ''}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: name.length > 14 ? 104 : 136, fontWeight: 700, letterSpacing: -5, lineHeight: 1 }}>{name}</div>
          <div style={{ display: 'flex', marginTop: 26, fontSize: 36, lineHeight: 1.25, color: '#FF8A4C', maxWidth: 900 }}>{p?.hook || ''}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{p?.headline?.metric || ''}</span>
            <span style={{ marginLeft: 22, marginBottom: 8, fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: '#9DA9B4', maxWidth: 520 }}>{p?.headline?.label || ''}</span>
          </div>
          <span style={{ fontSize: 24, letterSpacing: 5, textTransform: 'uppercase' }}>Adnan M. Sadad</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
