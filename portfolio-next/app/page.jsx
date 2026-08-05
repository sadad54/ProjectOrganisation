'use client';

import { useEffect } from 'react';
import { BODY_HTML } from './bodyMarkup';

export default function Page() {
  useEffect(() => {
    // dynamic import so it only ever runs client-side, after BODY_HTML is already in the DOM
    import('./siteScript');
  }, []);

  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
