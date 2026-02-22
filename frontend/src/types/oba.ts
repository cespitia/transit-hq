export interface StopReference {
  id: string;
  name: string;
  lat: number;
  lon: number;
  code?: string;
  direction?: string;
}

export interface StopsForLocationResponse {
  data: {
    references: {
      stops: StopReference[];
    };
    stops: {
      id: string;
      distance: number;
    }[];
  };
}

export interface ArrivalDeparture {
  routeId: string;
  tripId?: string;
  routeShortName?: string;
  headsign?: string;
  predictedArrivalTime?: number;
  scheduledArrivalTime?: number;
  status?: string;
}

export interface ArrivalsForStopResponse {
  data: {
    entry: {
      stopId: string;
      arrivalsAndDepartures: ArrivalDeparture[];
    };
  };
}