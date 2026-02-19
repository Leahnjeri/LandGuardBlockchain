import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ===============================
   Fix Leaflet marker icons
================================ */
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ===============================
   MAP CONTROLLER (PAN ONLY)
================================ */
function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.panTo(center); // 🔴 PAN ONLY — NO ZOOM
    }
  }, [center, map]);

  return null;
}

export default function LeafletVerifyLand({ titleNumber: initialTitle }) {
  const [titleNumber, setTitleNumber] = useState(initialTitle || "");
  const [landData, setLandData] = useState(null);
  const [polygonPositions, setPolygonPositions] = useState([]);

  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState("");

  const [landCenter, setLandCenter] = useState(null);
  const [landAddress, setLandAddress] = useState("");

  const landMarkerRef = useRef(null);

  /* ===============================
     LAYOUT CONSTANTS
  ================================ */
  const SIDEBAR_WIDTH = 256;
  const HEADER_HEIGHT = 150;

  const [mapSize, setMapSize] = useState({
    width: window.innerWidth - SIDEBAR_WIDTH,
    height: window.innerHeight - HEADER_HEIGHT,
  });

  useEffect(() => {
    const handleResize = () => {
      setMapSize({
        width: window.innerWidth - SIDEBAR_WIDTH,
        height: window.innerHeight - HEADER_HEIGHT,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===============================
     REVERSE GEOCODING
  ================================ */
  const reverseGeocode = async (lat, lon, setter) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      setter(data.display_name || "Unknown location");
    } catch {
      setter("Location unavailable");
    }
  };

  /* ===============================
     USER LOCATION (INITIAL)
  ================================ */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        reverseGeocode(loc[0], loc[1], setUserAddress);
      },
      () => console.warn("Geolocation denied")
    );
  }, []);

  /* ===============================
     SEARCH LAND
  ================================ */
  const handleSearch = async () => {
    if (!titleNumber.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:8000/lands/verify/${encodeURIComponent(titleNumber)}`
      );

      const data = await res.json();
      console.log("LAND RESPONSE:", data);

      if (!res.ok) {
        alert("Land not found");
        return;
      }

      setLandData(data);

      // 🔵 LAND CENTER (CORRECT SOURCE)
      const center = [
        data.coordinates[0].lat,
        data.coordinates[0].lon,
      ];
      setLandCenter(center);
      reverseGeocode(center[0], center[1], setLandAddress);

      // 🔵 POLYGON
      const coords = data.coordinates.map((p) => [p.lat, p.lon]);
      setPolygonPositions(coords);

      // 🔵 AUTO OPEN POPUP
      setTimeout(() => {
        landMarkerRef.current?.openPopup();
      }, 300);
    } catch (err) {
      console.error("FRONTEND ERROR:", err);
      alert("Error fetching land");
    }
  };
  useEffect(() => {
  if (initialTitle) {
    handleSearch();
  }
}, [initialTitle]);

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="w-full h-full overflow-hidden">
      {/* HEADER */}
      <div
        className="bg-white p-4 shadow"
        style={{ height: HEADER_HEIGHT }}
      >
        <h1 className="text-2xl font-bold text-[#4e342e] mb-2">
          Verify Land
        </h1>

        <div className="flex gap-3 mb-1">
          <input
            type="text"
            value={titleNumber}
            onChange={(e) => setTitleNumber(e.target.value)}
            placeholder="Enter Title Number e.g. NKR/1001"
            className="border p-2 rounded w-80"
          />
          <button
            onClick={handleSearch}
            className="bg-[#4e342e] text-white px-6 py-2 rounded"
          >
            Search
          </button>
        </div>

        {landData && (
          <div className="text-sm">
            <strong>Owner:</strong> {landData.owner_name} &nbsp;|&nbsp;
            <strong>Verified:</strong>{" "}
            {landData.is_verified ? "Yes" : "No"}
          </div>
        )}
        <button
  onClick={() =>
    window.open(
      `http://localhost:8000/certificates/${landData.search_id}`,
      "_blank"
    )
  }
  className="bg-green-700 text-white px-4 py-2 rounded ml-3"
>
  📄 Download Search Certificate
</button>

      </div>

      {/* MAP */}
      <MapContainer
        center={userLocation || [-0.0236, 37.9062]}
        zoom={6}
        style={{
          width: `${mapSize.width}px`,
          height: `${mapSize.height}px`,
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapController center={landCenter} />

        {/* USER LOCATION (ONLY BEFORE SEARCH) */}
        {!landCenter && userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <strong>📍 Your location</strong>
              <br />
              {userAddress}
            </Popup>
          </Marker>
        )}

        {/* LAND POLYGON */}
        {polygonPositions.length > 0 && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{ color: "green", fillOpacity: 0.4 }}
          />
        )}

        {/* LAND MARKER */}
        {landCenter && (
          <Marker position={landCenter} ref={landMarkerRef}>
            <Popup>
              <strong>📍 Land location</strong>
              <br />
              {landAddress}
              <hr />
              <strong>🧾 Title:</strong> {landData.title_number}
              <br />
              <strong>👤 Owner:</strong> {landData.owner_name}
              <br />
              <strong>📐 Size:</strong> {landData.dimensions}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
