"""
Optional Ollama integration for local LLM support.
Falls back gracefully if Ollama is not running.
"""
import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "mistral"


async def query_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                OLLAMA_URL,
                json={"model": model, "prompt": prompt, "stream": False},
            )
            if response.status_code == 200:
                return response.json().get("response", "").strip()
    except Exception:
        pass
    return None
