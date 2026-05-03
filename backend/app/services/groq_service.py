import os
import httpx
from typing import List

_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
_MODEL = "llama-3.1-8b-instant"


async def query_groq(messages: List[dict]) -> str | None:
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                _GROQ_URL,
                headers={"Authorization": f"Bearer {key}"},
                json={"model": _MODEL, "messages": messages, "max_tokens": 400, "temperature": 0.7},
            )
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        pass
    return None
