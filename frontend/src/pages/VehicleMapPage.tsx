import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import { fetchJSON } from "../api/client";
import type { FeatureCollection } from "../types/geojson";

const DEFAULT_CENTER: [number, number] = [-117.1611, 32.7157]; // Downtown San Diego
const DEFAULT_ZOOM = 13;

export default function VehicleMapPage() {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [geo, setGeo] = useState<FeatureCollection | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    async function loadVehicles() {
        try {
            setError(null);
            const data = await fetchJSON<FeatureCollection>("/api/vehicles.geojson");
            setGeo(data);
            setLastUpdated(Date.now());
        } catch (e: any) {
            setError(e?.message ?? "Failed to load vehicles");
        }
    }

    // Initialize map once
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: "raster",
                        tiles: [
                            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        ],
                        tileSize: 256,
                        attribution: "© OpenStreetMap contributors",
                    },
                },
                layers: [
                    {
                        id: "osm",
                        type: "raster",
                        source: "osm",
                    },
                ],
            },
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
        });

        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

        map.on("load", () => {
            // GeoJSON source with clustering enabled
            map.addSource("vehicles", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] },
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
            });

            // Cluster circles
            map.addLayer({
                id: "vehicle-clusters",
                type: "circle",
                source: "vehicles",
                filter: ["has", "point_count"],
                paint: {
                    "circle-radius": 16,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff",
                    "circle-color": "#1d4ed8",
                },
            });

            // Cluster count labels
            map.addLayer({
                id: "vehicle-cluster-count",
                type: "symbol",
                source: "vehicles",
                filter: ["has", "point_count"],
                layout: {
                    "text-field": "{point_count_abbreviated}",
                    "text-size": 12,
                },
                paint: {
                    "text-color": "#ffffff",
                },
            });

            // Unclustered vehicle points
            map.addLayer({
                id: "vehicle-unclustered",
                type: "circle",
                source: "vehicles",
                filter: ["!", ["has", "point_count"]],
                paint: {
                    "circle-radius": 5,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff",
                    "circle-color": "#2563eb",
                },
            });

            // Click cluster: zoom into it
            map.on("click", "vehicle-clusters", async (e) => {
                const features = map.queryRenderedFeatures(e.point, { layers: ["vehicle-clusters"] });
                const cluster = features[0] as any;

                if (!cluster) return;

                const clusterId = cluster.properties?.cluster_id;
                const source = map.getSource("vehicles") as maplibregl.GeoJSONSource;

                const zoom = await source.getClusterExpansionZoom(clusterId);
                const coords = cluster.geometry?.coordinates as [number, number];

                map.easeTo({ center: coords, zoom });
            });


            // Click unclustered point: popup
            map.on("click", "vehicle-unclustered", (e) => {
                const feature = e.features?.[0] as any;
                if (!feature) return;

                const coords = feature.geometry?.coordinates as [number, number];
                const props = feature.properties ?? {};

                const vehicleId = props.vehicleId ?? "vehicle";
                const route = props.routeShortName ? `Route ${props.routeShortName}` : "Route N/A";

                new maplibregl.Popup()
                    .setLngLat(coords)
                    .setHTML(
                        `<div style="font-size:12px">
              <div style="font-weight:700">${route}</div>
              <div>${vehicleId}</div>
            </div>`
                    )
                    .addTo(map);
            });

            // Cursor behaviors
            map.on("mouseenter", "vehicle-clusters", () => {
                map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", "vehicle-clusters", () => {
                map.getCanvas().style.cursor = "";
            });

            map.on("mouseenter", "vehicle-unclustered", () => {
                map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", "vehicle-unclustered", () => {
                map.getCanvas().style.cursor = "";
            });

            setIsMapLoaded(true);
        });

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

    // Update GeoJSON source when data changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !isMapLoaded || !geo) return;

        const src = map.getSource("vehicles") as maplibregl.GeoJSONSource | undefined;
        if (src) src.setData(geo as any);
    }, [geo, isMapLoaded]);

    const vehicleCount = geo?.features?.length ?? 0;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-md p-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-sm font-semibold text-blue-700">
                        ← Back
                    </Link>
                    <div className="text-sm font-semibold text-gray-700">Map</div>
                </div>

                <div className="mt-3 rounded-2xl bg-white p-4 shadow">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-lg font-bold text-gray-900">Live Vehicles</div>
                            <div className="text-sm text-gray-600">Clusters when zoomed out</div>
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
                        {vehicleCount} vehicles •{" "}
                        {lastUpdated ? `updated ${new Date(lastUpdated).toLocaleTimeString()}` : "updating..."}
                    </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl shadow">
                    <div ref={mapContainerRef} className="h-[65vh] w-full bg-gray-200" />
                </div>

                <div className="mt-4 text-xs text-gray-500">Map data © OpenStreetMap contributors</div>
            </div>
        </div>
    );
}
