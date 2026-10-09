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
            "You are the INFRALYTIX Governance AI Copilot, an expert advisor for Indian national infrastructure project monitoring. "
            "Your role is to explain project telemetry, delays, cost overruns, risk levels, and scenario forecasts in natural language. "
            "STRICT RULES:\n"
            "1. Ground all answers strictly in the provided project context data.\n"
            "2. DO NOT fabricate or invent dates, costs, project records, or risk scores.\n"
            "3. If information is not in the context, state clearly that it is unavailable.\n"
            "4. Structure your response in clear markdown with: Direct Answer, Key Project Facts, Detailed Explanation, and Suggested Action Directives.\n"
            "5. Maintain a professional, executive tone suitable for Cabinet Secretaries and Senior Project Directors."
        )

        prompt = f"""
USER QUESTION: {query}

AUTHORIZED PROJECT/PORTFOLIO CONTEXT:
{json.dumps(project_context, indent=2, default=str)}

Please provide a comprehensive, executive-grade natural language briefing answering the user's query.
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
                            "max_output_tokens": 1500,
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

            return {
                "answer": response.text.strip(),
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
            "You are an AI Infrastructure Analyst for INFRALYTIX. "
            "Your task is to explain a What-If Scenario simulation result for a major infrastructure project. "
            "You MUST evaluate and explain the THREE AUTHORITATIVE RATINGS:\n"
            "1. Health Score & Status (Health Rating)\n"
            "2. Predicted Schedule Lags (Schedule Delay Rating)\n"
            "3. Projected Final Outlay & Overrun (Cost/Capex Rating)\n"
            "and also explain the Risk Level & Score.\n\n"
            "CRITICAL CONSTRAINTS:\n"
            "- Do NOT alter or overwrite any numerical values or ratings supplied by the simulation engine.\n"
            "- Ground all reasons in the exact baseline vs scenario numbers provided.\n"
            "- Explain why each rating changed, whether the delta is favorable or unfavorable, and what uncertainties remain.\n"
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
