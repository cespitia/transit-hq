import json
import time
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FIXTURES_DIR = BASE_DIR / "fixtures"


def stops_for_location(lat: float, lon: float, radius: int) -> dict:
    # For now we ignore params and return a stable fixture.
    # Later we can add multiple fixtures or simple filtering.
    path = FIXTURES_DIR / "stops_for_location.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def arrivals_for_stop(stop_id: str) -> dict:
    path = FIXTURES_DIR / "arrivals_for_stop.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    now_ms = int(time.time() * 1000)

    arrivals = data["data"]["entry"]["arrivalsAndDepartures"]

    # Generate realistic times: 3–20 minutes from now
    for idx, a in enumerate(arrivals):
        minutes_out = random.randint(3 + idx * 2, 8 + idx * 5)
        scheduled = now_ms + minutes_out * 60 * 1000

        # 70% chance we have a predicted time
        if random.random() < 0.7:
            delay_ms = random.randint(-60, 180) * 1000
            predicted = scheduled + delay_ms
        else:
            predicted = 0

        a["scheduledArrivalTime"] = scheduled
        a["predictedArrivalTime"] = predicted

    data["data"]["entry"]["stopId"] = stop_id
    return data


def vehicle_positions() -> dict:
    path = FIXTURES_DIR / "vehicle_positions.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    now_ms = int(time.time() * 1000)

    # Slightly jitter vehicle positions and timestamps
    for v in data["vehicles"]:
        v["lat"] += random.uniform(-0.0005, 0.0005)
        v["lon"] += random.uniform(-0.0005, 0.0005)
        v["updatedAt"] = now_ms

    data["timestamp"] = now_ms
    return data
