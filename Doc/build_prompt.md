# INFRALYTIX MASTER BUILD PROMPT

You are a team of Senior Product Architects, UI/UX Designers, Data Scientists, Machine Learning Engineers, Backend Engineers, Frontend Engineers, and Infrastructure Architects.

Build a production-quality web application called **INFRALYTIX (Infrastructure Analytics & Intelligence Platform)**.

The project specification provided in `INFRALYTIX_Ready_to_Build_MVP.md` is the single source of truth.

---

## Mission

Transform infrastructure monitoring from descriptive reporting into predictive and prescriptive intelligence.

The platform must analyze infrastructure project data and provide:

- Cost overrun prediction
- Schedule delay prediction
- Risk scoring
- Early warning alerts
- Root cause analysis
- Intervention recommendations
- Scenario simulations

---

## Design Philosophy

Create a modern government-grade intelligence platform.

Characteristics:

- Professional
- Trustworthy
- Data-centric
- Clean
- Responsive
- Executive-friendly
- Analyst-friendly

Avoid:

- Cyberpunk styling
- Crypto dashboard appearance
- Excessive animations
- Gaming aesthetics

---

## Primary Workflow

Login

↓

Command Center

↓

Risk Radar

↓

Project Selection

↓

Project Intelligence

↓

AI Explanation

↓

Historical Similarity

↓

Intervention Recommendation

↓

Scenario Simulation

↓

Decision Support

---

## Required Modules

### 1. Command Center

Display:

- Total Projects
- Critical Projects
- Average Risk
- Cost Exposure
- Delay Exposure
- Recent Alerts

---

### 2. Project Explorer

Capabilities:

- Search
- Filters
- Sorting
- Pagination
- Sector Analysis
- Ministry Analysis

---

### 3. Risk Radar

Display:

- Risk distribution
- Risk heatmaps
- Sector risk
- State risk
- Ministry risk

---

### 4. Project Intelligence

Display:

- Project summary
- Progress metrics
- Cost metrics
- Milestone metrics
- Risk trajectory
- Historical performance

---

### 5. Cost Overrun Prediction

Generate:

- Probability score
- Confidence score
- Key contributing factors

---

### 6. Delay Prediction

Generate:

- Delay probability
- Estimated completion variance
- Key contributing factors

---

### 7. Risk Engine

Calculate:

Risk Score =

Cost Risk +
Delay Risk +
Milestone Risk +
Execution Risk +
Dependency Risk

Normalize score to 0–100.

---

### 8. Explainable AI

For every prediction provide:

- Top drivers
- Feature importance
- Human-readable explanation

Use SHAP.

---

### 9. Similar Project Intelligence

Identify historical projects with:

- Similar sector
- Similar cost
- Similar delay patterns
- Similar milestone behavior

Display comparison results.

---

### 10. Project Failure DNA

Identify recurring patterns including:

- Persistent milestone slippage
- Low execution velocity
- Escalating expenditure
- Dependency bottlenecks

Generate project risk signatures.

---

### 11. Intervention Intelligence

Generate recommendations.

Examples:

- Review contractor performance
- Accelerate approvals
- Increase execution resources
- Revisit milestone schedule

Recommendations must be linked to detected risk drivers.

---

### 12. What-If Simulator

Allow users to adjust:

- Progress rate
- Budget allocation
- Resource availability
- Milestone completion rate

Recalculate projected outcomes.

---

### 13. Risk Propagation Engine

Identify:

- Upstream dependencies
- Downstream dependencies
- Potential cascading delays

Visualize dependency impacts.

---

### 14. Geographic Intelligence

Display:

- State-level distribution
- Sector distribution
- Risk hotspots

Provide map visualization.

---

### 15. AI Copilot

Support questions such as:

- Which projects are most likely to be delayed?
- Why is project X high risk?
- Show projects similar to X.
- What interventions are recommended?

Responses must use actual project data.

---

## Dataset Usage

Use:

- projects.csv
- monthly_observations.csv
- milestones.csv
- dependencies.csv

Never use hardcoded project data.

All analytics must be dataset-driven.

---

## Model Requirements

Train:

### Delay Prediction Model

Input:

- Progress gap
- Milestone delays
- Cost growth
- Project age
- Sector

Output:

Delay probability.

---

### Cost Overrun Model

Input:

- Expenditure trends
- Milestone slippage
- Execution velocity
- Project characteristics

Output:

Cost overrun probability.

---

## Quality Requirements

Do not use:

- Placeholder text
- Lorem Ipsum
- Dummy charts
- Fake predictions
- Hardcoded risk scores

All outputs must originate from project data and model calculations.

---

## Deliverables

Generate:

Frontend

Backend

Database Schema

Machine Learning Pipeline

API Layer

Testing Framework

Deployment Configuration

Documentation

Demo Scenario

The final application should be suitable for demonstration at Smart India Hackathon and Ministry-level infrastructure monitoring use cases.