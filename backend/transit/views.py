from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .cache import get_cached_or_fetch, redis_client
from .providers.router import get_provider

# Only needed when provider=mts and upstream errors occur.
# Safe to import even if you are using mock.
from .mts_client import MTSClientError


@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "service": "transithq-backend"})


@api_view(["GET"])
def cache_health(request):
    try:
        redis_client.ping()
        return Response({"redis": "connected", "keys": redis_client.dbsize()})
    except Exception:
        return Response({"redis": "error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(["GET"])
def nearby_stops(request):
    # Required query params
    lat = request.query_params.get("lat")
    lon = request.query_params.get("lon")
    if lat is None or lon is None:
        return Response(
            {"error": "lat and lon query params are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Optional query params
    radius = request.query_params.get("radius", "600")  # meters

    try:
        lat_f = float(lat)
        lon_f = float(lon)
        radius_i = int(radius)
    except ValueError:
        return Response(
            {"error": "lat, lon must be numbers and radius must be an integer"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Clamp radius for safety
    radius_i = max(50, min(radius_i, 5000))

    provider = get_provider()

    cache_params = {
        "provider": provider.__name__,
        "lat": lat_f,
        "lon": lon_f,
        "radius": radius_i,
    }

    def fetch():
        return provider.stops_for_location(lat_f, lon_f, radius_i)

    try:
        data = get_cached_or_fetch("stops_for_location", cache_params, fetch)
        return Response(data)
    except MTSClientError as e:
        return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)