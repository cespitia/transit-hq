from rest_framework.decorators import api_view
from rest_framework.response import Response

from .cache import redis_client

@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "service": "transithq-backend"})

@api_view(["GET"])
def cache_health(request):
    try:
        redis_client.ping()
        return Response({"redis": "connected"})
    except Exception:
        return Response({"redis": "error"}, status=500)