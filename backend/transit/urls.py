from django.urls import path
from .views import health, cache_health

urlpatterns = [
    path("health", health),
    path("cache-health", cache_health),
]
