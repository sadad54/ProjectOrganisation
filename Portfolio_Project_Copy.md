# Portfolio Project Copy

Written in the XYZ format — *"Accomplished [X], as measured by [Y], by doing [Z]"* — so each bullet leads with impact, backs it with a number, and closes with the technical method. Pulled from your resume, project READMEs, and source code. Swap in real screenshots and live demo links once those are ready.

---

## ExpenSense
**Personal Finance AI — receipt scanning meets automated categorization**

Final-year project (published thesis) that turns paper receipts into clean, categorized spending data using OCR and on-device ML.

- Automated personal expense tracking by building an OCR + TensorFlow classification pipeline, achieving **85% categorization precision across 500+ receipts scanned per month**.
- Cut manual expense entry to seconds by building a Flutter mobile app with a Firebase backend that scans, classifies, and logs receipts in real time.
- Grounded the system academically by publishing an undergraduate thesis on OCR-based personal finance tracking for income tax readiness.

**Tech stack:** Flutter, Dart, Firebase, TensorFlow, OCR

---

## Aura
**AI Wellness & Mindfulness Companion**

A mood-tracking and mindfulness app that turns journaling and habit data into personalized, AI-generated insights.

- Helped users build consistent self-care habits by designing a full wellness experience spanning mood tracking, guided journaling, meditation timers, ambient soundscapes, and daily routines.
- Delivered personalized behavioral insights by integrating the Gemini API to analyze mood, journal, and habit patterns and surface AI-generated correlations and affirmations.
- Built a polished, themeable cross-platform UI by developing a component-driven design system in React and TypeScript — custom charts, animated progress rings, and mood orbs — on a Vite build pipeline.

**Tech stack:** React, TypeScript, Vite, Google Gemini API, Recharts

*Note: this repo is currently private — make it public (or write a strong standalone description) before linking it from the portfolio.*

---

## AI Financial Fraud Detection System
**(your local project name: Credit Card Fraud Detection)**

An ensemble ML system that catches fraudulent transactions in a highly imbalanced, real-world dataset.

- Detected fraudulent transactions with high precision by engineering an ensemble pipeline — Random Forest, XGBoost, and Isolation Forest — trained on **284,807 real transactions**, reaching a **0.98 ROC-AUC and 0.89 PR-AUC** on held-out data.
- Solved a severe class-imbalance problem (a **0.17% fraud rate**) by applying SMOTE oversampling and class-weighted loss, and prioritizing PR-AUC as the evaluation metric for rigorous imbalanced-class scoring.
- Made the model production-usable by wrapping it in a FastAPI inference service with Pydantic validation and OpenAPI docs, plus a Streamlit dashboard for batch scanning and explainability.

**Tech stack:** Python, XGBoost, Scikit-learn, FastAPI, Streamlit, SMOTE

*Note: this project isn't on GitHub yet — push it to a new repo before linking it from the portfolio.*

---

## WC26 Predictor
**(your local project name: World Cup Predictor)**

An end-to-end football analytics pipeline that forecasts World Cup 2026 outcomes with Monte Carlo simulation.

- Forecasted match outcomes and tournament results by building a full analytics pipeline on historical match results, FIFA rankings, rolling form, squad proxies, head-to-head history, and match-context features.
- Simulated the entire World Cup 2026 bracket by running Monte Carlo simulations across group qualification and knockout stages to produce finalist and champion probabilities.
- Made the predictions explorable by shipping an interactive dashboard with tournament-path curves, group-pressure matrices, player-form impact views, and predicted-vs-actual audit metrics.

**Tech stack:** Python, XGBoost, FastAPI, React, TypeScript, Recharts

---

## AI Chatbot Engineer Assessment
**(your local project name: Mindhive ZUS Chatbot)**

A production-style RAG chatbot with agentic planning, Text2SQL, and stateful multi-turn memory, built for the Mindhive Asia AI Chatbot Engineer assessment.

- Handled multi-turn customer conversations by designing a stateful conversational AI with intent-based agentic planning that tracked context across 3-5 related turns.
- Answered product and outlet questions accurately by building FastAPI microservices for RAG-based product search — tested against **200+ product documents** — and a SQL-injection-safe Text2SQL outlet-query endpoint.
- Shipped it as a complete, demo-ready product with an OpenAPI specification, a full test suite, architecture diagrams, and a hosted demo.

**Tech stack:** Python, FastAPI, RAG (FAISS), Text2SQL, SQLite

*Note: this repo (sadad54/chatbotZUS) is currently private — the code lives locally at D:\RAG\chatbot. Make it public, or write a strong standalone description, before linking it from the portfolio. A vercel.json is already in the repo, so it's close to a one-click deploy for a live demo link.*

---

## InterviewPilot
**AI-Powered Mock Interview Platform**

A full-stack platform that simulates realistic technical interviews with adaptive follow-up questions and evidence-backed scoring.

- Simulated realistic technical interviews by architecting a full-stack platform — FastAPI/SQLAlchemy backend, React/TypeScript frontend — powered by Whisper-large-v3 for speech transcription and Llama 3.3 70B for interview evaluation.
- Delivered consistent, trustworthy scoring by designing a rubric-based evaluator that returns schema-validated JSON (technical accuracy, clarity, depth) with a self-correcting repair loop that re-prompts the model on its own invalid output.
- Made the interview experience adaptive by building an agentic follow-up question generator that reasons over a candidate's answer to decide whether to probe deeper — mirroring real interviewer behavior.
- Backed the whole system with conventional-commit discipline, a pytest suite with fully mocked Groq calls, a Dockerfile for reproducible deployment, and GitHub Actions CI on every push.

**Tech stack:** Python, FastAPI, SQLAlchemy, React, TypeScript, Groq API (Whisper-large-v3, Llama 3.3 70B), Docker, GitHub Actions

---

## Before this goes on the site
1. Push the fraud detection project to GitHub.
2. Decide whether to make Aura and the ZUS chatbot repos public (or keep them private and just show the write-up + screenshots).
3. Capture real screenshots for all six — see the Action Checklist tab in `Portfolio_Projects_Tracker.xlsx`.
4. Where possible, deploy for a live demo link (the ZUS chatbot already has a `vercel.json`, so that's the fastest one).
