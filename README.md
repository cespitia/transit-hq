# TransitHQ

TransitHQ is a real-time transit intelligence platform for San Diego MTS.

It improves upon traditional arrival apps by introducing a backend gateway that normalizes upstream feeds, enforces a stable API contract, and provides a scalable foundation for reliability analytics and system intelligence.

Unlike typical rider apps that directly consume agency APIs, TransitHQ is designed as a full-stack system built for performance, extensibility, and data ownership.

## Vision
TransitHQ is evolving from a real-time arrival interface into a transit intelligence platform capable of detecting service instability, identifying vehicle bunching, and providing actionable reliability insights.

## Objectives
- Deliver a fast, mobile-first web experience for nearby stops, arrivals, vehicles, and alerts
- Improve performance and consistency via a backend proxy with Redis caching
- Build toward intelligence features like arrival confidence, headway analysis, and historical reliability

## Demo Features
- Nearby stops based on rider location
- Real-time arrivals and departures
- Live vehicle map with clustering
- Vehicle detail drawer (route, speed, bearing, last updated)
- GeoJSON-based vehicle rendering
- Redis-backed response caching
- Provider abstraction (mock + MTS-ready)

## Architecture
Frontend (React + TypeScript) -> Backend API (Django REST) -> Redis (real-time cache) + Postgres (static + history)

## Design Principles
- Provider abstraction layer: Seamlessly switch between mock data and live MTS feeds.
- Stable internal API contract: The frontend never depends directly on external agency formats.
- GeoJSON-native mapping: Enables clustering, filtering, heatmaps, and advanced analytics.
- Scalable data model: Built to support historical ingestion and reliability analysis.

GeoJSON-native mapping
Enables clustering, filtering, heatmaps, and advanced analytics.

Scalable data model
Built to support historical ingestion and reliability analysis.

## Roadmap
### Phase 1: MVP (MTS real-time gateway)
- Backend proxy for MTS OneBusAway Where API
- GTFS-Realtime vehicle integration
- Nearby stops, arrivals, vehicles
- Redis caching and rate-limit protection

### Phase 2: Own the data layer
- GTFS static ingestion into Postgres
- GTFS-Realtime ingestion:
  - Redis for latest state
  - Postgres for historical storage
- Route classification and mode metadata

### Phase 3: Intelligence layer
- Arrival confidence scoring
- Headway and bunching detection
- Route-level reliability metrics
- Historical delay analytics
- Multi-agency adapter support

## Tech Stack
### Frontend
- React
- TypeScript
- TailwindCSS
-MapLibre (GeoJSON-based mapping)

### Backend
- Django REST Framework
- Redis
- Postgres
-Provider abstraction pattern

## Screenshots
