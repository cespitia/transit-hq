# TransitHQ

TransitHQ is a real-time transit intelligence platform for San Diego MTS. It improves on traditional arrival apps by providing a mobile-first rider experience, a backend gateway that normalizes upstream feeds, and a scalable foundation for reliability scoring and analytics.

## Objectives
- Deliver a fast, mobile-first web experience for nearby stops, arrivals, vehicles, and alerts
- Improve performance and consistency via a backend proxy with Redis caching
- Build toward intelligence features like arrival confidence, headway analysis, and historical reliability

## Architecture
Frontend (React + TypeScript) -> Backend API (Django REST) -> Redis (real-time cache) + Postgres (static + history)

## Roadmap
### Phase 1: MVP (MTS real-time gateway)
- Backend proxy for MTS OneBusAway Where API and GTFS-Realtime feeds
- Nearby stops, stop arrivals, live vehicles, service alerts
- Basic caching, error handling, and rate-limit friendly polling

### Phase 2: Own the data layer
- GTFS static ingestion into Postgres
- GTFS-Realtime ingestion into Redis (latest) + Postgres (history)

### Phase 3: Intelligence layer
- Arrival confidence scoring
- Headway and bunching detection
- Reliability analytics and dashboards
- Expand beyond MTS (multi-agency adapters)
