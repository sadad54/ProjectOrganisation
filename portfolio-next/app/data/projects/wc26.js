export default {
  slug: 'wc26',
  name: 'WC26 Predictor',
  year: '2026',
  kind: 'ML + simulation',
  hook: 'Every path to the trophy, simulated ten thousand times.',
  headline: {
    metric: '10,000',
    label: 'tournaments simulated per forecast',
  },
  overview: {
    summary:
      'WC26 Predictor is an end-to-end forecasting system for the FIFA World Cup 2026: a feature-engineered modelling pipeline feeds a Monte Carlo tournament simulation, surfaced through an interactive React dashboard that shows uncertainty, not just a winner.',
    bullets: [
      'Simulated the full tournament bracket <b>10,000 times per forecast</b> by chaining match-outcome and scoreline probability models into a group-and-knockout Monte Carlo engine.',
      'Made every prediction auditable after the fact by shipping a <b>predicted-vs-actual audit view</b> alongside the forecast itself.',
      'Kept live-score data honest with a <b>provider-aware ingestion chain</b> (football_data → api_football → community_worldcup → cache) that surfaces provider health and source authenticity instead of silently trusting one source.',
    ],
  },
  story: {
    situation:
      "A simple who-wins predictor doesn't demonstrate modelling depth, uncertainty handling, or product thinking — anyone can print a single number.",
    task:
      "Build a system where the full pipeline is inspectable: how teams advance, where uncertainty concentrates, how squad-quality assumptions move the odds, and how the model's calls compare to what actually happened.",
    action:
      'Engineered features from historical results, FIFA rankings, rolling form, squad proxies, head-to-head history and match context; trained outcome/xG/scoreline models; ran Monte Carlo tournament simulation for group qualification through champion odds; built a FastAPI backend and a React+TypeScript+Recharts dashboard with tournament-path curves, a group-pressure matrix, player-form impact views, and the audit panel; added provider-aware live-score ingestion with explicit fallback and health reporting.',
    result:
      'A single project that touches feature engineering, applied ML, simulation, API design, and data-viz/frontend product work end to end — explicitly built to be inspected, not just trusted.',
  },
  architecture: {
    summary:
      'Raw historical football data is turned into a feature table, fed through outcome and scoreline models, then run through a Monte Carlo tournament simulation before reaching the dashboard.',
    diagram: {
      type: 'flow',
      steps: [
        { label: 'Raw historical data', sub: 'results, FIFA rankings, squad proxies, head-to-head' },
        { label: 'Cleaning & normalization' },
        { label: 'Feature engineering', sub: 'form, rankings, squad, context, head-to-head' },
        { label: 'Match outcome + expected-goals models' },
        { label: 'Scoreline probability generation' },
        { label: 'Group + knockout Monte Carlo simulation' },
        { label: 'Dashboard CSV exports' },
        { label: 'FastAPI backend → React + TypeScript + Recharts dashboard' },
      ],
    },
  },
  highlights: [
    {
      title: 'One forecast, ten thousand simulated tournaments',
      caption:
        'Turned a single point prediction into a full uncertainty picture by running <b>10,000 simulated tournaments</b> per forecast instead of one.',
      diagram: {
        type: 'branch',
        root: 'Match-level outcome + xG models',
        branches: [
          { label: 'Group qualification', sub: 'per-team probability' },
          { label: 'Round of 32 → knockout' },
          { label: 'Finalists' },
        ],
        outcome: '10,000 simulations → champion odds',
      },
    },
    {
      title: 'Provider-aware live scores, never silently wrong',
      caption:
        'Surfaced provider health, cache age and official-vs-community status on every score instead of pretending one source always works.',
      diagram: {
        type: 'flow',
        steps: [
          { label: 'auto' },
          { label: 'football_data', sub: 'football-data.org' },
          { label: 'api_football', sub: 'API-Football' },
          { label: 'community_worldcup', sub: 'community API' },
          { label: 'local cache fallback' },
        ],
      },
    },
  ],
  limitations: [
    'Player-form modelling is a conservative squad proxy, not full live club-form modelling.',
    'Some live-score providers restrict 2026 tournament data by API plan.',
    'Community live-score data is useful for demos but is explicitly not official FIFA data.',
  ],
  screenshots: {
    dir: 'wc26-predictor',
    count: 20,
    alt: 'WC26 Predictor dashboard: tournament-path probability curves, a group-pressure matrix, and a predicted-versus-actual audit panel.',
  },
  chips: ['Python', 'XGBoost', 'FastAPI', 'React', 'TypeScript', 'Recharts', 'Monte Carlo'],
  links: [
    { label: 'Repository', href: 'https://github.com/sadad54/worldcup_predictor' },
    { label: 'The trade-off behind this', href: '#slide-sim', internal: true },
  ],
};
