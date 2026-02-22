import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import { fetchJSON } from "../api/client";
import type { VehiclePositionsResponse, Vehicle } from "../types/vehicles";

const DEFAULT_CENTER: [number, number] = [-117.1611, 32.7157]; // Downtown SD
const DEFAULT_ZOOM = 13;

export default function VehicleMapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const vehiclesById = useMemo(() => {
    const m = new Map<string, Vehicle>();
    for (const v of vehicles) m.set(v.vehicleId, v);
    return m;
  }, [vehicles]);

  async function loadVehicles() {
    try {
      setError(null);
      const data = await fetchJSON<VehiclePositionsResponse>("/api/vehicles");
      setVehicles(data.vehicles ?? []);
      setLastUpdated(Date.now());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load vehicles");
    }
  }

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Poll vehicles
  useEffect(() => {
    loadVehicles();
    const id = window.setInterval(loadVehicles, 10_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render/update markers when vehicles change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers = markersRef.current;

    // Remove markers that are no longer present
    for (const [vehicleId, marker] of markers.entries()) {
      if (!vehiclesById.has(vehicleId)) {
        marker.remove();
        markers.delete(vehicleId);
      }
    }

    // Add/update markers
    for (const v of vehicles) {
      const existing = markers.get(v.vehicleId);

      const el = document.createElement("div");
      el.className =
        "w-3 h-3 rounded-full bg-blue-600 ring-2 ring-white shadow";

      // Label via title attribute
      el.title = v.routeShortName ? `Route ${v.routeShortName}` : v.vehicleId;

      if (!existing) {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([v.lon, v.lat])
          .addTo(map);

        markers.set(v.vehicleId, marker);
      } else {
        existing.setLngLat([v.lon, v.lat]);
      }
    }
  }, [vehicles, vehiclesById]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-md p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-blue-700">
            ← Back
          </Link>
          <Link to="/map" className="text-sm font-semibold text-gray-700">
            Map
          </Link>
        </div>

        <div className="mt-3 rounded-2xl bg-white p-4 shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-gray-900">Live Vehicles</div>
              <div className="text-sm text-gray-600">
                Refreshes every ~10 seconds
              </div>
            </div>
            <button
              onClick={loadVehicles}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Refresh
            </button>
          </div>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

          <div className="mt-3 text-xs text-gray-500">
            {vehicles.length} vehicles •{" "}
            {lastUpdated ? `updated ${new Date(lastUpdated).toLocaleTimeString()}` : "updating..."}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl shadow">
          <div ref={mapContainerRef} className="h-[65vh] w-full bg-gray-200" />
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Map data © OpenStreetMap contributors
        </div>
      </div>
    </div>
  );
}
