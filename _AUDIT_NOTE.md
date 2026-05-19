# Audit Recommendations & Status — akarsuadvisory

Source: /Users/erolakarsu/projects/_AUDIT/reports/batch_09.md

Verdict per audit: partial-build, 10 AI endpoints, 19 non-AI routes. Strong AI content generation and lead scoring; could benefit from proposal/engagement automation.

## Original audit recommendations

Missing AI: not specifically called out beyond proposal/engagement automation gap.

Missing non-AI:
- Proposal generation (beyond templates)
- Engagement tracking
- Retainer billing
- Knowledge base / wiki
- Calendar integration

Custom feature ideas:
- Predictive engagement modeling
- White-paper generation from case study data
- Consultant matching by industry/challenge
- Predictive pricing for services
- Client communication timeline optimization
- CRM integration (Salesforce/HubSpot)
- Thought-leadership automation
- Webinar/speaking opportunity identification

## Implemented in this pass (MECHANICAL)

Added two new endpoints to existing `backend/routes/ai.js` (matches existing style: shared `aiComplete`, `parseJsonFromAI`, `auth`).

- `POST /api/ai/generate-proposal` — draft a structured consulting proposal in markdown.
- `POST /api/ai/predict-engagement` — predicted probability of follow-on engagement with reasons + recommended actions.

## Backlog

1. White-paper generation from case study data — straightforward AI add-on; deferred.
2. Predictive pricing for services — text-only AI add-on.
3. Consultant matching by industry / challenge — needs richer profile data.
4. CRM integration — credentials decision (Salesforce / HubSpot).
5. Calendar integration — credentials decision (Google Calendar / O365).
6. Retainer billing — substantial product feature.

## Apply pass 3 (frontend)

- Frontend stack: Vite React. Both apply-pass-2 endpoints (`/generate-proposal`, `/predict-engagement`) already routed under `/admin/ai/generate-proposal` and `/admin/ai/predict-engagement` to dedicated pages `AdminGenerateProposal.jsx` and `AdminPredictEngagement.jsx`. Routes are admin-protected via `ProtectedRoute`.
- Action: **LEFT-AS-IS** — FE already wired. No files changed.

## Apply pass 4 (mechanical backlog)

Three new mechanical AI endpoints added and surfaced as tabs in the existing AI Center (`AdminAI.jsx`). Each follows the existing `aiComplete` + `parseJsonFromAI` pattern, gates on `OPENROUTER_API_KEY` (returns HTTP 503 if absent), and uses JWT bearer auth via the shared `useAuth().api` helper.

| # | Endpoint | BE file | FE tab |
|---|----------|---------|--------|
| 1 | `POST /api/admin/ai/generate-white-paper` | `backend/routes/ai.js` | `AdminAI.jsx` "White Paper" tab |
| 2 | `POST /api/admin/ai/predict-pricing` | `backend/routes/ai.js` | `AdminAI.jsx` "Pricing Predictor" tab |
| 3 | `POST /api/admin/ai/match-consultant` | `backend/routes/ai.js` | `AdminAI.jsx` "Consultant Matcher" tab |

Sourced from prior backlog items: white-paper generation from case study data, predictive pricing for services, consultant matching by industry/challenge.

Backlog items still deferred: CRM integration (NEEDS-CREDS), calendar integration (NEEDS-CREDS), retainer billing (NEEDS-PRODUCT-DECISION).

Smoke test: `OPENROUTER_API_KEY=""` BE on port 39111 → login as admin → curl all three endpoints → all return 503 with the configured message. Health = 200, login = 200.
