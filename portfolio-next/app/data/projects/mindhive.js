export default {
  slug: 'mindhive',
  name: 'Mindhive Chatbot',
  year: '2025',
  kind: 'RAG + Text2SQL',
  hook: 'Five turns deep and still on topic.',
  headline: {
    metric: '36',
    label: 'documents in the RAG eval corpus · 85.0% Hit Rate@1 (MRR 0.8625)',
  },
  overview: {
    summary:
      'Mindhive is a multi-turn chatbot for a coffee-outlet brand that routes each question to either a product-RAG endpoint or an outlet Text2SQL endpoint through one intent planner, holding context across follow-up turns instead of treating every message as new.',
    bullets: [
      'Reached <b>85.0% Hit Rate@1</b> (MRR 0.8625) across a 20-query hand-labeled eval set by combining a product-RAG endpoint with an outlet-lookup Text2SQL endpoint behind one intent router.',
      'Resolved <b>100% of outlet-lookup queries correctly</b> (MRR 1.0000) versus 70% on product queries — a real, honest gap the eval surfaces rather than smooths over.',
      'Protected the outlet-lookup endpoint from injection by validating and constraining generated SQL before execution.',
    ],
  },
  story: {
    situation:
      'A take-home technical assessment asked for a chatbot that can answer both unstructured product questions and structured outlet-location questions.',
    task:
      'Handle both question types through one coherent multi-turn agent, not two disconnected demos glued together, and ship it like a real product rather than a notebook.',
    action:
      "Built two FastAPI-backed capabilities — a RAG endpoint over the product corpus and a Text2SQL endpoint over outlet data — behind a single intent-routing planner that decides per turn whether a question is a fresh product/outlet lookup or a refinement of the previous answer, and added a retrieval-quality eval harness (TF-IDF baseline, since the production sentence-transformer model isn't available in CI) to keep the RAG side honest rather than assumed-good.",
    result:
      'Delivered a complete repository — OpenAPI spec, test suite, architecture diagrams, hosted demo — for what was framed as an assessment, demonstrating the same engineering rigor (tests, docs, honest eval baselines) as a production submission.',
  },
  architecture: {
    summary:
      'One intent planner decides, per turn, whether a question routes to product-RAG or outlet Text2SQL, or refines the previous turn’s answer.',
    diagram: {
      type: 'flow',
      steps: [
        { label: 'User query' },
        { label: 'Intent planner', sub: 'app/planner/agent.py + intent.py' },
        { label: 'product_rag ⇄ outlet_text2sql', sub: 'router picks per turn' },
        { label: 'Response + trace' },
        { label: 'Conversational memory', sub: 'feeds next turn’s intent resolution' },
      ],
    },
  },
  highlights: [
    {
      title: 'Turn-by-turn intent resolution',
      caption:
        'Resolved <b>100% of outlet-lookup queries correctly</b> (MRR 1.0000) by routing structured location questions to Text2SQL instead of forcing every query through the same retrieval path.',
      diagram: {
        type: 'flow',
        steps: [
          { label: '“Outlets in PJ?”', sub: 'intent: outlet_lookup → Text2SQL' },
          { label: '“Which opens earliest?”', sub: 'resolves against prior result → intent: outlet_refine' },
          { label: '“Is it halal certified?”', sub: 'intent: product_rag' },
        ],
      },
    },
  ],
  limitations: [
    'The committed retrieval eval uses TF-IDF + cosine similarity as a conservative baseline, not an exact reproduction of production retrieval quality — production uses a sentence-transformer embedding model unavailable in the CI environment that generated these numbers.',
    'Product-RAG retrieval (70% Hit Rate@1) is measurably weaker than outlet Text2SQL (100%) on this baseline, reported as-is rather than only showing the stronger number.',
  ],
  screenshots: {
    dir: 'mindhive-chatbot',
    count: 9,
    alt: 'Mindhive chatbot: a multi-turn conversation about ZUS outlets, resolving a follow-up question against the previous answer.',
  },
  chips: ['FastAPI', 'RAG', 'Text2SQL', 'OpenAPI', 'Agentic planning'],
  links: [{ label: 'Repository', href: 'https://github.com/sadad54/chatbotZUS' }],
};
