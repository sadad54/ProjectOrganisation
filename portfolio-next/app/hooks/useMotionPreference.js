'use client';
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function useMotionPreference() {
  const system = useReducedMotion();
  const [manual, setManual] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setManual(root.classList.contains('rm'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return Boolean(system || manual);
}
