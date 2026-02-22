import { BrowserRouter, Routes, Route } from "react-router-dom";
import NearbyStopsPage from "./pages/NearbyStopsPage";

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">TransitHQ</h1>
        <p className="mt-2 text-gray-600">
          Real-time transit intelligence platform for San Diego MTS.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NearbyStopsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
