/* The assistant's knowledge base: the site's own data, cut into citable
   chunks. Nothing here is written for the assistant — it reads the same
   files the pages render, so an answer can't know something the site
   doesn't say. Built once per server process. */
import { WORK, DOMAINS } from '../../data/work';
import projects from '../../data/projects';
import { SKILL_GROUPS, ALSO } from '../../data/skills';
import { CARD } from '../../data/profile';
import { KNOWLEDGE } from '../../data/knowledge';

const strip = (s) =>
  String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// every string leaf under a value, in order
function leaves(v, out = []) {
  if (v == null) return out;
  if (typeof v === 'string') out.push(strip(v));
  else if (Array.isArray(v)) v.forEach((x) => leaves(x, out));
  else if (typeof v === 'object') Object.values(v).forEach((x) => leaves(x, out));
  return out;
}

// long sections split on sentence boundaries so a citation stays specific
function split(text, max = 900) {
  if (text.length <= max) return [text];
  const out = [];
  let cur = '';
  for (const s of text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) || [text]) {
    if (cur && cur.length + s.length > max) {
      out.push(cur.trim());
      cur = '';
    }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const SECTIONS = {
  overview: 'Overview',
  story: 'The story',
  architecture: 'Architecture',
  highlights: 'Highlights',
  limitations: 'Limitations',
};

function build() {
  const chunks = [];
  const add = (c) => {
    split(c.text).forEach((text, i, all) => chunks.push({ ...c, id: all.length > 1 ? `${c.id}-${i + 1}` : c.id, text }));
  };

  // the index of all 18 projects
  for (const p of WORK) {
    const href = p.page ? `/work/${p.slug}` : '/#work';
    add({
      id: `${p.slug}#summary`,
      title: p.name,
      section: p.page ? 'Project summary' : 'Archive project',
      href,
      text: [
        `${p.name} (${p.year}) — ${p.kind}. Area: ${DOMAINS[p.domain]?.label || p.domain}.`,
        p.tier === 'case' && 'One of the featured case studies.',
        p.badge && `${p.badge}.`,
        p.hook,
        p.metric && `Headline number: ${p.metric.value} — ${p.metric.label}.`,
        ...leaves(p.notes),
        p.stack?.length && `Stack: ${p.stack.join(', ')}.`,
      ]
        .filter(Boolean)
        .join(' '),
    });
  }

  // case studies, one chunk (or a few) per section
  for (const p of Object.values(projects)) {
    for (const [key, label] of Object.entries(SECTIONS)) {
      const text = leaves(p[key]).join(' ');
      if (text) add({ id: `${p.slug}#${key}`, title: p.name, section: `Case study · ${label}`, href: `/work/${p.slug}`, text: `${p.name} — ${label.toLowerCase()}: ${text}` });
    }
  }

  // the toolkit: which skills, and which projects actually use each
  for (const g of SKILL_GROUPS) {
    const rows = g.skills.map((s) => {
      const used = WORK.filter((p) => p.stack?.some((x) => s.m.includes(x.toLowerCase()))).map((p) => p.name);
      return used.length ? `${s.n} (used in ${used.join(', ')})` : s.n;
    });
    add({ id: `skills#${g.name.toLowerCase().replace(/[^a-z]+/g, '-')}`, title: 'Toolkit', section: g.name, href: '/#toolkit', text: `Skills — ${g.name}: ${rows.join('; ')}.` });
  }
  if (ALSO?.length) add({ id: 'skills#also', title: 'Toolkit', section: 'Also', href: '/#toolkit', text: `Also familiar with: ${ALSO.join(', ')}.` });

  add({
    id: 'about#model-card',
    title: 'About',
    section: 'The model card',
    href: '/#about',
    text: CARD.map(([k, v]) => `${k}: ${v}.`).join(' '),
  });

  KNOWLEDGE.forEach(add);
  return chunks;
}

let cache = null;
export function corpus() {
  if (!cache) cache = build();
  return cache;
}
