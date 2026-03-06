import os

from openai import OpenAI


openrouter = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": os.getenv("NEXT_PUBLIC_URL", "http://localhost:3000"),
        "X-Title": "AgentOS",
    },
)

MODELS = {
    "free": {
        "general": "meta-llama/llama-3.3-70b-instruct:free",
        "coding": "qwen/qwen3-coder:free",
        "analysis": "mistralai/mistral-small-3.1-24b-instruct:free",
    },
    "pro": {
        "general": "anthropic/claude-haiku-4-5",
        "coding": "anthropic/claude-haiku-4-5",
        "analysis": "anthropic/claude-haiku-4-5",
        "ceo": "anthropic/claude-haiku-4-5",
    },
    "agency": {
        "general": "anthropic/claude-haiku-4-5",
        "coding": "anthropic/claude-sonnet-4-6",
        "analysis": "anthropic/claude-sonnet-4-6",
        "ceo": "anthropic/claude-sonnet-4-6",
    },
}


def get_model(plan: str, role: str) -> str:
    tier = "agency" if plan in {"agency", "enterprise"} else "pro" if plan == "pro" else "free"

    if role == "ceo":
        return MODELS[tier].get("ceo", MODELS[tier]["general"])
    if role in {"coder", "tech_lead", "qa"}:
        return MODELS[tier]["coding"]
    if role == "analyst":
        return MODELS[tier]["analysis"]
    return MODELS[tier]["general"]


def call_agent(plan: str, role: str, system_prompt: str, user_message: str) -> str:
    response = openrouter.chat.completions.create(
        model=get_model(plan, role),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
    )
    return response.choices[0].message.content or ""
