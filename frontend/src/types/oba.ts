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
