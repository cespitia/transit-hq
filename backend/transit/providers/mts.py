from ..mts_client import stops_for_location as mts_stops_for_location


def stops_for_location(lat: float, lon: float, radius: int) -> dict:
    return mts_stops_for_location(lat, lon, radius)
