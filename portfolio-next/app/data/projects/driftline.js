export default {
  slug: 'driftline',
  name: 'Driftline',
  year: '2026',
  kind: 'Streaming ML / MLOps',
  hook: 'A model decays in silence. The retrain has to beat it on the same holdout to ship.',
  // which field formation sits behind this page (lib/neural/formations.js)
  field: 3,
  headline: {
    metric: '0.4802',
    label: 'candidate PR-AUC vs 0.2811 incumbent, same holdout',
  },
  overview: {
    summary:
      'Driftline replays 590K real IEEE-CIS transactions through a Kafka-API broker and a stateful stream processor, scores it with a fraud model, and automatically detects and recovers from performance drift with a shadow-scored, gated retraining loop.',
    bullets: [
      'Replayed <b>590K transactions</b> through Redpanda/PyFlink and built GraphSAGE over a <b>605K-node graph</b> with unit-tested leakage controls.',
      'Measured XGBoost honestly: PR-AUC <b>0.4751 on a chronological split</b> versus 0.6974 on a random split that lets the future leak into training.',
      'Drift-triggered retraining behind a promotion gate: the candidate scored <b>PR-AUC 0.4802 versus 0.2811</b> for the incumbent on the same holdout.',
      'Served XGBoost via ONNX/FastAPI on Google Cloud: <b>10,018 requests, zero failures, 380 ms p95</b> at 50 concurrent users on a 4-vCPU VM.',
    ],
  },
  story: {
    situation:
      'Fraud models decay silently in production, and most portfolio fraud projects demonstrate a single offline metric and stop there.',
    task:
      "Build something that reproduces real drift, catches it automatically, and proves the recovery with a gate that can't be gamed by evaluating on the future.",
    action:
      'Replayed real IEEE-CIS data through Redpanda/PyFlink for stateful 1h/24h/7d velocity features, trained a GraphSAGE entity-graph model over a 605K-node graph alongside XGBoost with unit-tested leakage controls, then wired PSI/KS drift detection to a retrain → shadow-score → promotion-gate loop logged to MLflow. Documented failures as deliverables, not embarrassments: the GraphSAGE+XGBoost ensemble never beat XGBoost alone (root-caused to naive equal-weight averaging and a genuinely undertrained 5-epoch CPU-only GNN); a random split scored XGBoost at PR-AUC 0.6974 against 0.4751 on the honest chronological split; a load test against the k3d deployment produced a real HPA scale event (2→4 replicas) and a real kubelet-triggered restart from liveness probes failing under saturation. Several infra bugs were found by actually running things: a Parquet-durability bug under SIGTERM, a silently-dropped column, an orphaned JVM process outliving `timeout` by about an hour, a graph node-id collision, CI disk exhaustion from an unscoped CUDA torch install, and a silent numpy upgrade breaking XGBoost\'s np.NaN usage.',
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
        'Every retrain is shadow-scored against the incumbent on the same holdout before it can ship: the first candidate scored <b>0.4802 PR-AUC against 0.2811</b>, so a bad candidate can never self-promote.',
      diagram: {
        type: 'loop',
        nodes: [
          { label: 'PSI/KS drift monitor', sub: 'weekly, 369 features' },
          { label: 'Retrain candidate' },
          { label: 'Shadow-score', sub: 'vs. incumbent, held-out tail' },
          { label: 'Promotion gate', sub: '≤0.02 PR-AUC regression' },
        ],
        gateLabel: 'First promotion: candidate 0.4802 vs. incumbent 0.2811 on the identical shadow holdout',
      },
    },
    {
      title: 'The split that flatters, and the one that ships',
      caption:
        'A random split scored XGBoost at <b>0.6974</b> PR-AUC. The chronological split — train on the past, test on the future, the way the model is actually used — scored <b>0.4751</b>. The lower number is the one reported.',
      diagram: {
        type: 'compare',
        before: {
          eyebrow: 'Random split',
          label: 'PR-AUC 0.6974',
          lines: ['Future rows leak into training', 'Flatters the model'],
        },
        after: {
          eyebrow: 'Chronological split',
          label: 'PR-AUC 0.4751',
          lines: ['Trains on the past only', 'The number reported'],
        },
      },
    },
  ],
  limitations: [
    'The Spark alternative ingestion path was never built — Redpanda/PyFlink is the only path exercised.',
    'Device and email-domain graph entities were not added to the entity graph beyond card/address/identity values.',
    'The GraphSAGE ensemble is built and measured but not wired into the live serving path — XGBoost alone serves.',
    'The k3d Kubernetes manifests cover only the scorer service, not the full pipeline.',
    'A fix for the single-uvicorn-worker liveness-probe failure under load was identified but not yet re-benchmarked.',
  ],
  screenshots: null,
  chips: [
    'Python', 'Redpanda', 'PyFlink', 'Feast', 'XGBoost', 'PyTorch Geometric',
    'FastAPI', 'ONNX Runtime', 'MLflow', 'Kubernetes', 'Prometheus / Grafana',
  ],
  links: [{ label: 'Repository', href: 'https://github.com/sadad54/driftline' }],
};
