export default {
  slug: 'driftline',
  name: 'Driftline',
  year: '2026',
  kind: 'Streaming ML / MLOps',
  hook: 'Six months of silent model decay, caught and reversed by the pipeline itself.',
  headline: {
    metric: '+97.8%',
    label: 'PR-AUC recovered after drift',
  },
  overview: {
    summary:
      'Driftline replays six months of real IEEE-CIS transaction data through a Kafka-API broker and a stateful stream processor, scores it with a fraud model, and automatically detects and recovers from performance drift with a shadow-scored, gated retraining loop.',
    bullets: [
      'Reproduced a real, un-injected performance decay — PR-AUC <b>0.4761 → 0.3680</b> over six months, a 22.7% relative decline — by replaying real IEEE-CIS transactions through a live-shaped streaming pipeline instead of a static notebook.',
      'Recovered a mid-replay collapse from <b>PR-AUC 0.2635 to 0.5211</b> (week 14 → 15) by building a PSI/KS drift monitor that triggers shadow-scored, gated retraining.',
      'Found and quantified a real feature-store skew — <b>8.66%</b> of sampled (card1, window) pairs disagreed between the Redis and Parquet write paths — by testing them against each other instead of assuming consistency.',
    ],
  },
  story: {
    situation:
      'Fraud models decay silently in production, and most portfolio fraud projects demonstrate a single offline metric and stop there.',
    task:
      "Build something that reproduces real drift, catches it automatically, and proves the recovery with a gate that can't be gamed by evaluating on the future.",
    action:
      'Replayed real IEEE-CIS data through Redpanda/PyFlink for stateful 1h/24h/7d velocity features, trained a GraphSAGE entity-graph model (605K nodes, ~8M edges) alongside XGBoost with a tested leakage boundary, then wired PSI/KS drift detection to a retrain → shadow-score → promotion-gate loop logged to MLflow. Documented failures as deliverables, not embarrassments: the GraphSAGE+XGBoost ensemble never beat XGBoost alone (root-caused to naive equal-weight averaging and a genuinely undertrained 5-epoch CPU-only GNN); a random 80/20 split inflated PR-AUC by +0.2222 versus the honest time-ordered split; a load test against the k3d deployment produced a real HPA scale event (2→4 replicas) and a real kubelet-triggered restart from liveness probes failing under saturation. Several infra bugs were found by actually running things: a Parquet-durability bug under SIGTERM, a silently-dropped column, an orphaned JVM process outliving `timeout` by about an hour, a graph node-id collision, CI disk exhaustion from an unscoped CUDA torch install, and a silent numpy upgrade breaking XGBoost\'s np.NaN usage.',
    result:
      'A project whose central claim — everything here is either real and measured or explicitly labeled simulated — held up under its own scrutiny, including when that scrutiny produced a negative result (the ensemble) instead of a positive one.',
  },
  architecture: {
    summary:
      "Real Redpanda/PyFlink streaming infrastructure replays historical data at a controllable rate — the README is explicit that 'real-time' here means a replay, not live production traffic, which is a deliberate honesty choice, not something to hide.",
    diagram: {
      type: 'flow',
      steps: [
        { label: 'replay_producer.py', sub: 'emits IEEE-CIS events in TransactionDT order' },
        { label: 'Redpanda (Kafka API)', sub: 'topic transactions.raw, 6 partitions, keyed by card1' },
        { label: 'PyFlink windowed aggregation', sub: '1h / 24h / 7d velocity features' },
        { label: 'Feast online (Redis) / offline (Parquet) stores' },
        { label: 'Scoring service', sub: 'FastAPI + ONNX Runtime, XGBoost' },
        { label: 'Monitoring', sub: 'PSI/KS drift on 369 features + Prometheus/Grafana' },
        { label: 'Drift-triggered retrain → shadow-score → promotion gate → MLflow' },
        { label: 'Kubernetes (k3d)', sub: 'HPA, 2–6 replicas' },
      ],
    },
  },
  highlights: [
    {
      title: 'Drift-triggered retrain, shadow-scored and gated',
      caption:
        'Recovered PR-AUC from <b>0.2635 to 0.5211</b> by gating every retrain behind a causal shadow-score comparison against the incumbent, so a bad candidate can never self-promote.',
      diagram: {
        type: 'loop',
        nodes: [
          { label: 'PSI/KS drift monitor', sub: 'weekly, 369 features' },
          { label: 'Retrain candidate' },
          { label: 'Shadow-score vs. incumbent', sub: 'held-out tail, same window' },
          { label: 'Promotion gate', sub: '≤0.02 PR-AUC regression' },
        ],
        gateLabel: 'First promotion: candidate 0.4802 vs. incumbent 0.2811 on the identical shadow holdout',
      },
    },
    {
      title: 'The online/offline skew that would have gone unnoticed',
      caption:
        "Found a real <b>8.66%</b> mismatch between the online and offline feature stores by testing Feast's two write paths against each other instead of assuming consistency.",
      diagram: {
        type: 'compare',
        before: {
          eyebrow: 'Redis (online)',
          label: 'Per-event write',
          lines: ['Writes on every event', 'Briefly ahead of offline'],
        },
        after: {
          eyebrow: 'Parquet (offline)',
          label: '200-row buffered flush',
          lines: ['Batches before flush', 'Durability-vs-latency tradeoff'],
        },
        diffLabel: '8.66% mismatch',
      },
    },
  ],
  limitations: [
    'The Spark alternative ingestion path was never built — Redpanda/PyFlink is the only path exercised.',
    'Device and email-domain graph entities were not added to the entity graph beyond card/address/identity values.',
    'The GraphSAGE ensemble is built and measured but not wired into the live serving path — XGBoost alone serves.',
    'The k3d Kubernetes manifests cover only the scorer service, not the full pipeline.',
    'A fix for the single-uvicorn-worker liveness-probe failure under load was identified but not yet re-benchmarked.',
    "No demo video has been recorded yet — this page's placeholder is exactly that gap.",
  ],
  screenshots: null,
  chips: [
    'Python', 'Redpanda', 'PyFlink', 'Feast', 'XGBoost', 'PyTorch Geometric',
    'FastAPI', 'ONNX Runtime', 'MLflow', 'Kubernetes', 'Prometheus / Grafana',
  ],
  links: [{ label: 'Repository', href: 'https://github.com/sadad54/driftline' }],
};
