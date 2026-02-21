import os
import json
import hashlib
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "15"))

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)


def build_cache_key(prefix: str, params: dict) -> str:
    """
    Create deterministic cache key from prefix + sorted params.
    """
    serialized = json.dumps(params, sort_keys=True)
    hashed = hashlib.md5(serialized.encode()).hexdigest()
    return f"{prefix}:{hashed}"


def get_cached_or_fetch(prefix: str, params: dict, fetch_func):
    """
    Returns cached value if present.
    Otherwise calls fetch_func(), stores result, returns result.
    """
    key = build_cache_key(prefix, params)

    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)

    result = fetch_func()

    redis_client.setex(
        key,
        CACHE_TTL_SECONDS,
        json.dumps(result)
    )

    return result
