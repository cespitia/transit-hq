import os
import requests
from dotenv import load_dotenv

load_dotenv()

MTS_OBA_BASE = os.getenv("MTS_OBA_BASE", "").rstrip("/")
MTS_OBA_KEY = os.getenv("MTS_OBA_KEY") or os.getenv("MTS_API_KEY")
HTTP_TIMEOUT_SECONDS = float(os.getenv("HTTP_TIMEOUT_SECONDS", "10"))


class MTSClientError(Exception):
    pass


def _get(url: str, params: dict) -> dict:
    try:
        headers = {
            "User-Agent": "TransitHQ/0.1",
            "Accept": "application/json",
        }

        resp = requests.get(url, params=params, headers=headers, timeout=HTTP_TIMEOUT_SECONDS)

        content_type = resp.headers.get("Content-Type", "")
        body_snippet = (resp.text or "")[:400].replace("\n", " ")

        if resp.status_code >= 400:
            raise MTSClientError(
                f"MTS request failed: HTTP {resp.status_code} | Content-Type: {content_type} | Body: {body_snippet}"
            )

        # Some upstreams return HTML with 200. Catch that.
        if "application/json" not in content_type.lower():
            raise MTSClientError(
                f"MTS returned non-JSON: HTTP {resp.status_code} | Content-Type: {content_type} | Body: {body_snippet}"
            )

        return resp.json()

    except requests.exceptions.Timeout as e:
        raise MTSClientError("MTS request timed out") from e
    except requests.exceptions.RequestException as e:
        raise MTSClientError(f"MTS request failed: {e}") from e
    except ValueError as e:
        raise MTSClientError(
            "MTS returned invalid JSON (response body was not JSON)"
        ) from e

def stops_for_location(lat: float, lon: float, radius: int) -> dict:
    if not MTS_OBA_BASE:
        raise MTSClientError("MTS_OBA_BASE is not set")

    url = f"{MTS_OBA_BASE}/stops-for-location.json"
    params = {"lat": lat, "lon": lon, "radius": radius}

    # OneBusAway deployments commonly accept/require `key` :contentReference[oaicite:3]{index=3}
    if MTS_OBA_KEY:
        params["key"] = MTS_OBA_KEY

    return _get(url, params=params)

