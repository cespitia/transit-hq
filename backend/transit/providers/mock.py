import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FIXTURES_DIR = BASE_DIR / "fixtures"


def stops_for_location(lat: float, lon: float, radius: int) -> dict:
    # For now we ignore params and return a stable fixture.
    # Later we can add multiple fixtures or simple filtering.
    path = FIXTURES_DIR / "stops_for_location.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
