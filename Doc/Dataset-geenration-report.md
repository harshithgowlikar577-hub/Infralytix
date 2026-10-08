# Dataset Generation Prompt for INFRALYTIX

## Executive Summary  
This prompt instructs the AI to generate a **realistic synthetic PAIMANA-style infrastructure dataset** for the INFRALYTIX platform. The dataset must be anchored to official MoSPI/PAIMANA statistics and mirror real-world project behaviors. Specifically, it should match the reported totals of ~1,981 projects with revised cost ₹42.78 lakh crore and expenditure ₹20.36 lakh crore. The synthetic data will include project details, monthly progress records, milestones, and dependency links, and will embed realistic delay causes (land acquisition, clearances, funding, contractor issues, weather, legal disputes, etc.). Hidden ML labels (delay overrun probabilities, risk scores) must be computed consistently from the data. The output will be four CSV files plus a README summarizing methodology, along with validation tables and an ER diagram.

---

## Target Scale and Official Totals  
- **Default Scale:** 300 projects with 12 months of history each (for internal hackathon MVP).  
- **Full Scale:** 1,981 projects with 24 months history (for SIH final).  
- **Official Anchors:** Adjust totals proportionally. The 1981-project scenario should have ~₹37.13 lakh crore original cost, ₹42.78 lakh crore revised cost, and ₹20.36 lakh crore expenditure. (For 300 projects, scale these by 300/1981 ≈ 15%).  
- **Validation Table:** Provide a table comparing 300 vs 1981 projects for key metrics:

  | Metric                    | 300 Projects (12 mo)        | 1,981 Projects (24 mo)        |
  |---------------------------|-----------------------------|-------------------------------|
  | Number of Projects        | 300                         | 1,981                         |
  | Months per Project        | 12                          | 24                            |
  | Total Monthly Records     | 3,600                       | ~47,544                       |
  | Milestone Records (est.)  | ~3,000                      | ~19,810                       |
  | Dependency Links (est.)   | ~500–1,000                  | ~3,000–5,000                  |
  | projects.csv size         | ~10 KB                      | ~70 KB                        |
  | monthly_observations.csv  | ~~200 KB~~ (2023 rows ~15MB?) Actually likely smaller. | ~~3 MB~~ (47544 rows ~230KB?) Rough estimates |
  | milestones.csv size       | ~50 KB                      | ~300 KB                       |
  | dependencies.csv size     | ~30 KB                      | ~150 KB                       |

*(Sizes are rough estimates. The focus is on row counts and structure.)*

These comparisons ensure the synthetic dataset scales correctly and matches official aggregates.

## Output Files and Schemas  
Generate the following CSV files (with headers as specified):

- **`projects.csv`** – one row per project. Include columns:  
  - `project_id` (e.g. “INF0001”), `project_name`, `ministry`, `sector`, `state`, `implementing_agency`  
  - `original_cost_cr`, `revised_cost_cr`, `current_expenditure_cr` (in Cr ₹)  
  - `approved_start_date`, `planned_completion_date`, `current_expected_completion_date`  
  - `physical_progress_pct`, `financial_progress_pct` (latest), `project_status` (e.g. Ongoing/Completed)  
  - Optionally: `risk_band` or `project_type`.  
  - *Example row*: `INF0001,Metro Rail Phase-II,Ministry of Housing & Urban Affairs,Urban Transport,Telangana,Metro Rail Corp,1200,1350,850,2023-04-01,2026-03-31,2026-11-30,51,41,Ongoing`  

- **`monthly_observations.csv`** – one row per project per month. Columns:  
  - `project_id`, `month` (YYYY-MM), `planned_progress_pct`, `actual_progress_pct`, `financial_progress_pct` (cumulative)  
  - `monthly_expenditure_cr`, `milestones_due`, `milestones_completed`, `milestones_delayed`  
  - `resource_utilization_pct` (e.g. % of planned manpower used), `execution_velocity` (e.g. progress % per month), `issue_category` (e.g. “Land Acquisition”).  
  - *Example row*: `INF0001,2025-04,58,46,51,27,2,0,2,80,5,Execution slowdown`  

- **`milestones.csv`** – one row per milestone. Columns:  
  - `milestone_id`, `project_id`, `milestone_name`, `planned_date`, `actual_date`, `delay_days`, `status` (On-Time/Delayed/Completed).  
  - *Example row*: `M001,INF0001,Land Acquisition,2024-12-31,2025-02-15,46,Delayed`  

- **`dependencies.csv`** – project dependency links. Columns:  
  - `project_id`, `dependent_project_id`, `dependency_type` (e.g. “upstream”/“downstream”/“linked”), `impact_level` (Low/Medium/High), `dependency_note`.  
  - *Example row*: `INF0001,INF004,downstream,High,Needs Power evacuation`  

Each CSV must include a header row. Ensure data types are consistent (e.g., dates as YYYY-MM-DD, percentages as integers). 

## Sector/Ministry/State Distribution  
Distribute projects across sectors and ministries using official patterns:  
- **Sector:** Transport & Logistics dominates ~55% of projects (1,459/1,981) and cost. Energy ~12% (221 projects), Water & Sanitation ~3% (67 projects), Communication ~0.6% (12 projects), Social & Commercial ~4% (77 projects), Others ~7% (145 projects).  
- **Ministries:** Roughly follow PIB breakdown: e.g., Road Transport & Highways ~57% (1,137 projects), Railways ~13% (260 projects), Coal ~7% (128), Petroleum & Natural Gas, Power, Housing & Urban Affairs, Water Resources & GR, etc. Remaining 7% distributed among other ministries (Higher Ed, Civil Aviation, etc.).  
- **States/UTs:** Spread projects across all major states/UTs. Weight projects by known infrastructure focus (e.g., many road/rail projects in Uttar Pradesh, Maharashtra, etc.). Include at least one project per state for diversity.  

The prompt should instruct the AI to use these distributions when generating `projects.csv`. Cite the press release as needed to justify these allocations.

## Project Behavior Types and Trajectories  
Assign projects into categories to create narrative patterns:  
- **Healthy (~30%)** – on-track projects: steadily increasing progress, on-schedule completions, low cost overruns. Example: “Healthy” projects where planned vs actual progress stay within 5–10%. Risk scores remain low (≈10–20).  
- **Deteriorating (~30%)** – projects gradually slipping: growing gap between planned and actual progress, occasional milestone delays. Example: progress gap rising from 15% to 30% over 12 months, moderate cost growth, risk score rising (e.g., 30→60).  
- **Critical (~20%)** – high-risk projects: repeated delays, low execution velocity, escalating costs. Example: physical progress stagnates while expenditure rises, multiple milestone slippages (land/legal issues), risk >80.  
- **Recovering (~20%)** – projects that start risky but improve: initial high risk declines as issues are resolved. Example trajectory: Risk score 82→79→68→54→39 over months, reflecting resolution of a major delay.  

Include specific numeric trajectories to allow a **golden demo project**. For instance, for project `INF0001` (critical project), risk rises from 31% to 87% between January and June (31, 39, 48, 62, 76, 87). This can be highlighted in the final demo. 

## Incident/Event Patterns  
Embed realistic causes of delays and overruns based on case studies. Common factors to include:  
- **Land Acquisition & Clearances** (forest/environmental): delays in acquiring land or obtaining permits.  
- **Contractor Issues:** mobilisation delays, labour shortages, project management problems.  
- **Funding/Expenditure Delays:** late fund releases, budget cuts.  
- **Technical/Material Delays:** equipment supply lags, design changes.  
- **Weather/Force Majeure:** monsoon impacts, natural disasters.  
- **Legal/Administrative:** court cases, Right-of-Way disputes, policy changes.  

Map these to spikes in milestones delayed and risk scores. For example, a sudden increase in milestones_delayed may be tagged “Land Acquisition” or “Clearance Delay”. Use the delay cause list from PAIMANA’s 2014 report as guidance. 

## Hidden ML Labels  
Alongside the visible data, compute **hidden target labels** for model training:  
- `delay_probability` (0–100% risk of schedule slip),  
- `cost_overrun_probability` (0–100%),  
- `overall_risk_score` (0–100, combining delays, costs, milestones),  
- `will_delay` (binary: 0/1 indicating if project eventually slips beyond deadline),  
- `will_overrun` (binary: 0/1 if cost exceeds original).  

These should be statistically consistent with the synthetic inputs. For example, a project with recurring milestone delays and low execution velocity would have high `delay_probability` and likely `will_delay=1`. Use simple rules or calculations (no need for full ML here) to assign these labels, and mention that they must not conflict with aggregated stats (e.g. if 10% of projects “will_delay”, that should be reflected in monthly trends).

## Reproducibility and Validation  
- Set a fixed random seed to ensure reproducibility.  
- **Aggregate Constraints:** Ensure sums of costs and expenditures match official aggregates within a small margin. For 300-project mode, total original/revised costs should be ~15% of the official totals.  
- **Validation Report:** At the end, produce a summary report (e.g. `generation_report.md`) that compares:  
  - Number of projects by sector/ ministry/ state vs targets,  
  - Total original/revised cost and expenditure vs official figures,  
  - Sample first 10 rows of each CSV with description,  
  - Basic statistics (mean/median progress, risk score distribution).  
- Use citations to verify official numbers and delay factors.

## Golden Demo Project  
Explicitly generate one highlight project (e.g., `INF0001`) as a demo case:  
- **Name:** e.g. “River Diversion Project – Phase I” (or similar).  
- **Pattern:** Critical-high risk: e.g. risk rises Jan→Jun: 31, 39, 48, 62, 76, 87.  
- **Description:** Document a storyline: early delays (e.g. “Land Acquisition” held up, contractor change), then recovery steps (e.g. accelerate works).  
- Ensure this project has multiple milestone delays and high `delay_probability`.  

## Output and Artifacts  
The AI should output:  
- The four CSV files (`projects.csv`, `monthly_observations.csv`, `milestones.csv`, `dependencies.csv`) in the specified formats.  
- A **README** or report (`generation_report.md`) explaining the generation methodology, assumptions (seed, distributions used), and summarizing key stats (as above).  
- A **diagram** showing entity relationships (projects→observations, milestones, dependencies) (Mermaid syntax is acceptable). For example:  
  ```mermaid
  graph LR
    Projects[Projects] --> Observations[MonthlyObservations]
    Projects --> Milestones[Milestones]
    Projects --> Dependencies[Dependencies]
    Dependencies --> Projects
  ```  
- First 10 sample rows of each CSV embedded in the README for verification.

## Validation Checklist  
Before finalizing, verify that:  
- **Totals** match targets (within tolerance).  
- **Distributions** by sector/ministry roughly follow official proportions.  
- **Rows** count (e.g. ~3,600 vs ~47,500 monthly records) is correct.  
- **Labels** (delay_probability, etc.) are non-contradictory.  
- **Risk trajectories** in sample projects align with category descriptions.  

Include all citations for official data in the prompt, so that the generation rationale is documented.

## References  
- Ministry of Statistics PIB Flash Report, May 25 2026 (PAIMANA summary).  
- Academic analysis of Indian infrastructure delays (causes like land acquisition, design, payments).  
- News coverage on PAIMANA delays (common reasons: land, clearance, funding, legal).  
- (Use these sources to justify distributions and delay factors in the dataset.)

