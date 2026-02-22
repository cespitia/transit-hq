export interface Vehicle {
  vehicleId: string;
  routeShortName?: string;
  lat: number;
  lon: number;
  bearing?: number;
  speed?: number;
  updatedAt?: number;
}

export interface VehiclePositionsResponse {
  timestamp?: number;
  vehicles: Vehicle[];
}
