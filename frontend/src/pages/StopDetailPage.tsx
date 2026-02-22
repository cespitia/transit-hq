import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchJSON } from "../api/client";
import type { ArrivalsForStopResponse, ArrivalDeparture } from "../types/oba";

function formatTime(ms?: number) {
  if (!ms || ms <= 0) return "N/A";
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function bestArrival(a: ArrivalDeparture) {
  return a.predictedArrivalTime && a.predictedArrivalTime > 0
    ? a.predictedArrivalTime
    : a.scheduledArrivalTime;
}

export default function StopDetailPage() {
  const { stopId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [arrivals, setArrivals] = useState<ArrivalDeparture[]>([]);

  const stopIdSafe = stopId ?? "";

  async function load() {
    if (!stopIdSafe) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchJSON<ArrivalsForStopResponse>(
        `/api/stops/${encodeURIComponent(stopIdSafe)}/arrivals`
      );
      setArrivals(data.data.entry.arrivalsAndDepartures ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopIdSafe]);

  const sorted = useMemo(() => {
    return [...arrivals].sort((a, b) => (bestArrival(a) ?? 0) - (bestArrival(b) ?? 0));
  }, [arrivals]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="text-sm font-semibold text-blue-700"
          >
            ← Back
          </Link>
          <div className="text-sm text-gray-600">Stop</div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow mb-4">
          <div className="text-xs text-gray-500">Stop ID</div>
          <div className="font-semibold text-gray-900 break-all">{stopIdSafe}</div>
        </div>

        <button
          onClick={load}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white mb-4"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh arrivals"}
        </button>

        {error && <div className="mb-3 text-red-600">{error}</div>}

        <div className="space-y-3">
          {sorted.length === 0 && !loading && !error && (
            <div className="text-gray-600">No arrivals available.</div>
          )}

          {sorted.map((a, idx) => {
            const eta = bestArrival(a);
            const isPred = !!(a.predictedArrivalTime && a.predictedArrivalTime > 0);

            return (
              <div key={`${a.routeId}-${idx}`} className="rounded-xl bg-white p-4 shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {a.routeShortName ?? "Route"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {a.headsign ?? "Destination"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatTime(eta)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isPred ? "predicted" : "scheduled"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
