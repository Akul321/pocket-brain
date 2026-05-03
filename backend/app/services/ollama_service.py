"""
Optional Ollama integration for local LLM support.
Falls back gracefully if Ollama is not running.
"""
import httpx
from typing import List

_BASE = "http://localhost:11434"
DEFAULT_MODEL = "mistral"


async def query_ollama_chat(messages: List[dict], model: str = DEFAULT_MODEL) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(
                f"{_BASE}/api/chat",
                json={"model": model, "messages": messages, "stream": False},
            )
            if r.status_code == 200:
                return r.json().get("message", {}).get("content", "").strip()
    except Exception:
        pass
    return None


async def query_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{_BASE}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
            )
            if r.status_code == 200:
                return r.json().get("response", "").strip()
    except Exception:
        pass
    return None
