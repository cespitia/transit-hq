export type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type Feature = {
  type: "Feature";
  geometry: GeoJSONPoint;
  properties: Record<string, any>;
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
  properties?: Record<string, any>;
};
