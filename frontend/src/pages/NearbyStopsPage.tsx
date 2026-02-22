import { useEffect, useState } from "react";
import { fetchJSON } from "../api/client";
import type { StopsForLocationResponse } from "../types/oba";

export default function NearbyStopsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stops, setStops] = useState<
    { id: string; name: string; distance: number }[]
  >([]);

  async function loadStops(lat: number, lon: number) {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchJSON<StopsForLocationResponse>(
        `/api/stops/nearby?lat=${lat}&lon=${lon}&radius=600`
      );

      const refs = data.data.references.stops;
      const stopDistances = data.data.stops;

      const merged = stopDistances.map((s) => {
        const ref = refs.find((r) => r.id === s.id);
        return {
          id: s.id,
          name: ref?.name ?? s.id,
          distance: s.distance,
        };
      });

      setStops(merged);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadStops(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setError("Unable to retrieve location");
      }
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Nearby Stops
        </h1>

        <button
          onClick={requestLocation}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold mb-4"
        >
          Use My Location
        </button>

        {loading && (
          <div className="text-gray-600">Loading nearby stops...</div>
        )}

        {error && (
          <div className="text-red-600 mb-2">{error}</div>
        )}

        <div className="space-y-3">
          {stops.map((stop) => (
            <div
              key={stop.id}
              className="bg-white rounded-xl p-4 shadow"
            >
              <div className="font-semibold">{stop.name}</div>
              <div className="text-sm text-gray-500">
                {(stop.distance / 1).toFixed(0)} meters away
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
