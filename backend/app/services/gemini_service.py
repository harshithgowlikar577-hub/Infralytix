import logging
import json
from typing import Dict, Any, Optional, List
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Shared Google Gemini AI Service for INFRALYTIX.
    Acts as an additive explanation and conversational reasoning layer
    over backend analytics, ML model predictions, and What-If scenario simulations.
    """

    def __init__(self):
        self._client = None

    def is_available(self) -> bool:
        """
        Check if Gemini integration is enabled and configured with a valid API key.
        """
        if not settings.GEMINI_ENABLED:
            return False
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key.strip() == "" or "your_" in api_key.lower():
            return False
        return True

    def _get_client(self):
        """
        Lazy loading of google.genai Client.
        """
        if self._client is not None:
            return self._client

        if not self.is_available():
            return None

        try:
            from google import genai
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
            return self._client
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {str(e)}")
            return None

    def generate_copilot_response(
        self,
        query: str,
        project_context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Generates user-friendly Copilot response grounded strictly in authorized project telemetry.
        """
        client = self._get_client()
        if not client:
            return None

        system_instruction = (
            "You are the INFRALYTIX AI Copilot, a helpful assistant that explains Indian infrastructure projects to people who are not technical experts. "
            "Talk like a knowledgeable colleague, not like a formal report.\n"
            "STRICT RULES — follow these exactly:\n"
            "1. Start your answer immediately with the relevant information. Do NOT start with 'Based on...' or 'The portfolio exhibits...' or introductory sentences.\n"
            "2. Use ONLY facts from the provided project data. Never invent project names, costs, dates, delays, or risk scores.\n"
            "3. If data is missing, say: 'I couldn't find that in the available records.'\n"
            "4. For simple questions: answer in 40-80 words. For complex questions or lists: up to 150 words maximum.\n"
            "5. Do NOT use markdown headers (no ###, ##, #). Do not use horizontal rules (---). Use plain sentences.\n"
            "6. Bold (**) is acceptable only for project names or key numbers. Use sparingly.\n"
            "7. When listing projects: use a simple table or bullet points. No long paragraphs for each item.\n"
            "8. Recommendations must be specific and actionable (e.g. 'Review PRJ1459 first — it has the longest delay at 790 days.').\n"
            "9. Explain numbers in plain words (e.g. '340 days late — that is about 11 months').\n"
            "10. NEVER use these phrases: 'telemetry', 'nodal', 'EPC contractor', 'capex deployment', 'ministerial directive', 'systemic slippage', 'mandate', 'governance SLA'."
        )

        prompt = f"""QUESTION: {query}

PROJECT DATA (use only this — do not add anything not here):
{json.dumps(project_context, indent=2, default=str)}

EXAMPLE OF A GOOD ANSWER (short, plain, direct):
Question: "Which projects need urgent attention?"
Good answer: "There are 705 critical-risk projects right now, averaging 11 months of delay. Start with PRJ1459, PRJ0319, and PRJ0573 — these have the longest delays and highest costs at risk. Open their detail pages and assign recovery targets."

EXAMPLE OF A BAD ANSWER (do not do this):
"### Direct Answer
Based on the current national infrastructure telemetry, 705 critical projects require immediate ministerial intervention. The portfolio exhibits systemic schedule slippage...
### Key Project Facts
* **Total Monitored Projects:** 1,981"

Now answer the actual QUESTION above. Plain English only. No headers. No long introductions. Maximum 150 words."""


        try:
            models_to_try = [
                settings.GEMINI_MODEL,
                "gemini-3.6-flash",
                "gemini-3.5-flash",
                "gemini-3.5-flash-lite",
                "gemini-3.7-flash",
                "gemini-3.8-flash",
                "gemini-flash-latest"
            ]



            seen = set()
            models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]

            response = None
            last_err = None
            for model_name in models_to_try:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config={
                            "system_instruction": system_instruction,
                            "temperature": 0.3,
                            "max_output_tokens": 600,
                        }
                    )
                    if response and response.text:
                        break
                except Exception as ex:
                    last_err = ex
                    logger.warning(f"Gemini model {model_name} failed: {str(ex)}")

            if not response or not response.text:
                if last_err:
                    logger.error(f"All Gemini models failed: {str(last_err)}")
                return None

            clean_answer = response.text.strip()
            # Clean up artificial headers if the model generated them
            for prefix in ["### Direct Answer\n", "### Direct Answer\r\n", "## Direct Answer\n", "# Direct Answer\n"]:
                if clean_answer.startswith(prefix):
                    clean_answer = clean_answer[len(prefix):].strip()

            return {
                "answer": clean_answer,
                "intent": project_context.get("intent", "GENERAL_QUERY"),
                "citations": project_context.get("citations", []),
                "suggested_actions": project_context.get("suggested_actions", [
                    {"label": "Executive Dashboard", "link": "/dashboard"},
                    {"label": "What-If Simulator", "link": "/simulator"},
                    {"label": "Early Warnings", "link": "/early-warnings"}
                ]),
                "is_offline": False,
                "engine_mode": f"GEMINI_LLM_{settings.GEMINI_MODEL}"
            }

        except Exception as e:
            logger.error(f"Gemini Copilot API error: {str(e)}")
            return None

    def explain_what_if_scenario(
        self,
        project_id: str,
        project_name: str,
        sector: str,
        state: str,
        baseline: Dict[str, Any],
        simulated: Dict[str, Any],
        net_improvement: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Generates personalized AI reasoning explaining the 3 existing What-If ratings:
        1. Health Score / Rating
        2. Predicted Delay / Schedule Rating
        3. Projected Final Cost & Overrun Rating
        plus Risk Score / Level.
        """
        client = self._get_client()
        if not client:
            return None

        system_instruction = (
            "You are the INFRALYTIX AI Copilot explaining a What-If simulation result for an infrastructure project. "
            "Write in clear, simple English that is easy for anyone to understand.\n"
            "RULES:\n"
            "- Do NOT change any numbers, ratings, or scores from the simulation data.\n"
            "- Explain each rating in plain words: what it means and why it changed.\n"
            "- Keep the 'summary' to 1-2 short, clear sentences.\n"
            "- Keep 'reason' fields under 40 words each — explain the cause simply.\n"
            "- Keep 'recommended_action' fields practical and direct (one sentence).\n"
            "- You MUST output a strict JSON object matching the requested schema."
        )

        prompt_data = {
            "project_id": project_id,
            "project_name": project_name,
            "sector": sector,
            "state": state,
            "baseline": baseline,
            "simulated": simulated,
            "net_improvement": net_improvement
        }

        prompt = f"""
SIMULATION SCENARIO TELEMETRY:
{json.dumps(prompt_data, indent=2, default=str)}

Return a JSON object with this EXACT structure:
{{
  "summary": "Clear 2-sentence executive summary of the scenario outcome.",
  "ratings": [
    {{
      "name": "Health Rating",
      "rating_value": "{simulated.get('health_status', 'Unknown')} ({simulated.get('health_score', 0)}/100)",
      "reason": "Detailed evidence-based explanation of why health score changed from {baseline.get('health_score', 0)} to {simulated.get('health_score', 0)}.",
      "baseline_comparison": "Gain of +{net_improvement.get('health_score_gain', 0)} points vs baseline.",
      "recommended_action": "Action directive to sustain or improve this health score.",
      "is_favorable": true
    }},
    {{
      "name": "Schedule Delay Rating",
      "rating_value": "{simulated.get('predicted_delay_days', 0)} Days ({simulated.get('predicted_delay_months', 0)} Months)",
      "reason": "Evidence-based explanation of critical path recovery from baseline delay of {baseline.get('predicted_delay_days', 0)} days.",
      "baseline_comparison": "Recovered {net_improvement.get('delay_recovered_days', 0)} days ({net_improvement.get('delay_recovered_months', 0)} months).",
      "recommended_action": "Nodal action required to achieve predicted schedule recovery.",
      "is_favorable": true
    }},
    {{
      "name": "Cost & Outlay Rating",
      "rating_value": "₹{simulated.get('predicted_final_cost', 0):,.2f} Cr ({simulated.get('cost_overrun_pct', 0)}% Overrun)",
      "reason": "Explanation of budget expansion vs cost avoidance gains.",
      "baseline_comparison": "Cost avoidance of ₹{net_improvement.get('cost_avoidance_cr', 0):,.2f} Cr compared to baseline final cost.",
      "recommended_action": "Financial oversight directive for budget deployment.",
      "is_favorable": true
    }},
    {{
      "name": "Risk Rating",
      "rating_value": "{simulated.get('risk_level', 'Unknown')} (Score: {simulated.get('risk_score', 0)})",
      "reason": "Explanation of risk score reduction from baseline risk score of {baseline.get('risk_score', 0)}.",
      "baseline_comparison": "Risk reduction of -{net_improvement.get('risk_score_reduction', 0)} points.",
      "recommended_action": "Risk mitigation protocol.",
      "is_favorable": true
    }}
  ],
  "main_benefit": "Primary tangible benefit of this scenario.",
  "main_tradeoff": "Primary trade-off or cost associated with this scenario.",
  "uncertainties": [
    "Key assumption or uncertainty that could impact completion."
  ],
  "next_steps": [
    "Recommended immediate operational next step."
  ]
}}
Ensure valid, parseable JSON output only.
"""

        try:
            models_to_try = [
                settings.GEMINI_MODEL,
                "gemini-3.6-flash",
                "gemini-3.5-flash",
                "gemini-3.5-flash-lite",
                "gemini-3.7-flash",
                "gemini-3.8-flash",
                "gemini-flash-latest"
            ]



            seen = set()
            models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]

            response = None
            last_err = None
            for model_name in models_to_try:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config={
                            "system_instruction": system_instruction,
                            "temperature": 0.2,
                            "response_mime_type": "application/json",
                            "max_output_tokens": 1500,
                        }
                    )
                    if response and response.text:
                        break
                except Exception as ex:
                    last_err = ex
                    logger.warning(f"Gemini What-If model {model_name} failed: {str(ex)}")

            if not response or not response.text:
                if last_err:
                    logger.error(f"Gemini What-If models failed: {str(last_err)}")
                return None

            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            parsed_data = json.loads(raw_text.strip())
            parsed_data["engine_mode"] = f"GEMINI_LLM_{settings.GEMINI_MODEL}"
            return parsed_data

        except Exception as e:
            logger.error(f"Gemini What-If explanation error: {str(e)}")
            return None

gemini_service = GeminiService()
