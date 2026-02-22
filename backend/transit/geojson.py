from typing import Dict, Any


def vehicles_to_geojson(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert VehiclePositionsResponse:
      { "timestamp": ..., "vehicles": [ { vehicleId, routeShortName, lat, lon, ... }, ... ] }
    into GeoJSON FeatureCollection.
    """
    ts = payload.get("timestamp")
    vehicles = payload.get("vehicles", [])

    features = []
    for v in vehicles:
        lat = v.get("lat")
        lon = v.get("lon")
        if lat is None or lon is None:
            continue

        props = {
            "vehicleId": v.get("vehicleId"),
            "routeShortName": v.get("routeShortName"),
            "bearing": v.get("bearing"),
            "speed": v.get("speed"),
            "updatedAt": v.get("updatedAt"),
            "timestamp": ts,
        }

        features.append(
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": props,
            }
        )

    return {"type": "FeatureCollection", "features": features, "properties": {"timestamp": ts}}
