# IncubaSmart — Business Incubation Decision Platform

**40% working college prototype for:**  
**Development of Business Incubation Framework for Data Ingestion, Predictive Modeling, and Strategic Resource Allocation using Machine Learning Techniques.**

## What this version demonstrates

The project is intentionally frontend-only and uses a transparent rule-based decision engine. It does **not** claim to be a trained ML model.

### Recruiter-facing features

1. **Startup Data Ingestion** — startup profile form with validation.
2. **Explainable Prediction** — 10-point weighted score with factor-level breakdown.
3. **Risk & Growth Assessment** — High / Medium / Low classifications derived from the score.
4. **Strategic Resource Allocation** — converts detected gaps into an illustrative support-budget plan.
5. **Next Best Action** — identifies the main intervention area and explains why.
6. **What-if Scenario Simulator** — sliders show how changes in growth, revenue, funding and team size affect the score.
7. **CSV Batch Ingestion** — upload multiple startup records and analyse them in-browser.
8. **Portfolio KPIs** — analysed startups, average score, high-potential count and dominant resource focus.
9. **Portfolio Comparison** — visual comparison of recent startup scores.
10. **Session History** — browser-local history for repeated demonstrations.
11. **Reports** — one-click text report and analysed CSV export.
12. **Dark mode** — persisted in localStorage and responsive UI.

## Data flow

```text
Startup / CSV data
       ↓
Input validation
       ↓
Explainable scoring engine
       ↓
Growth + Risk + Score
       ↓
Resource priority
       ↓
Illustrative allocation plan
       ↓
Next strategic action / report
```

## Current scoring logic

| Factor | Threshold | Points |
|---|---|---:|
| Monthly growth | ≥20% / ≥10% / below | 3 / 2 / 1 |
| Monthly revenue | ≥₹1,00,000 / ≥₹50,000 / below | 3 / 2 / 1 |
| Funding raised | ≥₹5,00,000 / ≥₹2,00,000 / below | 2 / 1 / 0 |
| Team size | ≥5 / below | 2 / 1 |

Composite score:
- **8–10:** High growth potential / Low risk
- **5–7:** Medium growth potential / Medium risk
- **0–4:** Low growth potential / High risk

## How to run

No installation or backend is required.

1. Open the `BusinessIncubation` folder in VS Code.
2. Run `index.html` with Live Server, or open it directly in a browser.
3. Click **Load demo data** for a quick presentation.
4. Use **What-if Simulator** to demonstrate predictive decision behaviour.
5. Use **CSV Portfolio Import** if you want to demonstrate batch data ingestion.

## Important presentation note

For a recruiter or faculty demo, describe the current prediction engine as:

> “An explainable rule-based prototype that demonstrates the predictive-modeling pipeline. A production version would replace this engine with a trained ML model using historical startup outcome data.”

Do **not** say that this version is a trained AI/ML model.

## Production roadmap

- Python/FastAPI model service
- Logistic Regression / Gradient Boosting trained on historical outcomes
- PostgreSQL/MongoDB persistence
- Authentication and role-based incubator access
- Feature importance and model confidence
- Google Maps/resource-location integration
- Scheduled data ingestion and monitoring


## v3 additions
- Startup status tracking (Under Review → Accepted → Mentorship → MVP Development → Traction → Scaled)
- Follow-up Action Tracker with status and due date
- Incubator Shortlist stored locally in the browser
- Data Quality / completeness indicator
These features keep the project browser-only while making the prototype more useful as an incubation operations dashboard.

## Additional Real-World Operations Features

The recruiter/demo version also includes lightweight incubation operations:

- Startup status tracking from review through scaling
- Follow-up action tracker with owner, priority, due date and status
- Incubator shortlist for startups requiring further review
- Data completeness indicator
- Financial health and estimated runway using revenue, operating expenses and funding
- Mentor Decision Log for review outcome and follow-up notes

These features remain browser-only and use localStorage. They are intended to demonstrate the workflow of an incubation decision-support product without claiming a production backend or trained ML model.
