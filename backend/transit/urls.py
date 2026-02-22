from django.urls import path
from .views import health, cache_health, nearby_stops, stop_arrivals

urlpatterns = [
    path("health", health),
    path("cache-health", cache_health),
    path("stops/nearby", nearby_stops),
    path("stops/<str:stop_id>/arrivals", stop_arrivals),
]
