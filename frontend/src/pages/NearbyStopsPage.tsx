// frontend/src/pages/NearbyStopsPage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchJSON } from "../api/client";
import type { StopsForLocationResponse } from "../types/oba";

type NearbyStop = {
  id: string;
  name: string;
  distance: number;
};

export default function NearbyStopsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stops, setStops] = useState<NearbyStop[]>([]);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lon: number } | null>(null);

  async function loadStops(lat: number, lon: number) {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchJSON<StopsForLocationResponse>(
        `/api/stops/nearby?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(
          String(lon)
        )}&radius=600`
      );

      const refs = data.data.references.stops ?? [];
      const stopDistances = data.data.stops ?? [];

      const merged: NearbyStop[] = stopDistances.map((s) => {
        const ref = refs.find((r) => r.id === s.id);
        return {
          id: s.id,
          name: ref?.name ?? s.id,
          distance: s.distance,
        };
      });

      setStops(merged);
      setLastCoords({ lat, lon });
    } catch (err: any) {
      setError(err?.message ?? "Failed to load nearby stops");
    } finally {
      setLoading(false);
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        loadStops(lat, lon);
      },
      (e) => {
        setLoading(false);
        setError(
          e.code === e.PERMISSION_DENIED
            ? "Location permission denied. Please allow location access and try again."
            : "Unable to retrieve location."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      }
    );
  }

  function refresh() {
    if (!lastCoords) return;
    loadStops(lastCoords.lat, lastCoords.lon);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">TransitHQ</h1>
          <p className="mt-1 text-sm text-gray-600">Nearby MTS stops (mock provider for now)</p>
        </div>

        <div className="space-y-3 mb-4">
          <button
            onClick={requestLocation}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Loading..." : "Use My Location"}
          </button>

          <button
            onClick={refresh}
            className="w-full rounded-xl bg-white py-3 font-semibold text-gray-900 shadow disabled:opacity-60"
            disabled={loading || !lastCoords}
          >
            Refresh
          </button>
        </div>

        {error && <div className="mb-3 rounded-xl bg-red-50 p-3 text-red-700">{error}</div>}

        {loading && <div className="text-gray-600">Fetching nearby stops...</div>}

        <div className="space-y-3">
          {stops.length === 0 && !loading && !error && (
            <div className="rounded-xl bg-white p-4 text-gray-600 shadow">
              Tap <span className="font-semibold">Use My Location</span> to load nearby stops.
            </div>
          )}

          {stops.map((stop) => (
            <Link
              key={stop.id}
              to={`/stops/${encodeURIComponent(stop.id)}`}
              className="block rounded-xl bg-white p-4 shadow transition active:scale-[0.99]"
            >
              <div className="font-semibold text-gray-900">{stop.name}</div>
              <div className="mt-1 text-sm text-gray-500">{Math.round(stop.distance)} meters away</div>
              <div className="mt-2 text-xs text-blue-700">View arrivals →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
