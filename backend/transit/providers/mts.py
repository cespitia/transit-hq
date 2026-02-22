from ..mts_client import stops_for_location as mts_stops_for_location
from ..mts_client import arrivals_for_stop as mts_arrivals_for_stop


def stops_for_location(lat: float, lon: float, radius: int) -> dict:
    return mts_stops_for_location(lat, lon, radius)


def arrivals_for_stop(stop_id: str) -> dict:
    return mts_arrivals_for_stop(stop_id)
