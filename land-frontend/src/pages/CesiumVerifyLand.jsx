// CesiumVerifyLand.jsx
import React, { useState } from "react";
import { Viewer, Entity, PolygonGraphics } from "resium";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// ---- Cesium Ion Key ----
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmN2ZkNDM1ZC04M2EwLTQwNjktYWM4Yy1kZmJlOThiNTZlOGMiLCJpZCI6MzYyODUzLCJpYXQiOjE3NjM4MjYzOTR9.YCvkWNsRU2bTYnYkWdne7dwCCDcsEl_ekJBTSSTEE_o";

export default function CesiumVerifyLand() {
  const [titleNumber, setTitleNumber] = useState("");
  const [landData, setLandData] = useState(null);
  const [polygonPositions, setPolygonPositions] = useState([]);

  // -----------------------------------------
  // SEARCH LAND + DRAW POLYGON
  // -----------------------------------------
  const handleSearch = async () => {
    if (!titleNumber.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:8000/lands/verify/${encodeURIComponent(
          titleNumber
        )}`
      );

      if (!res.ok) {
        alert("Land not found");
        return;
      }

      const data = await res.json();
      setLandData(data);

      // Convert [["lon","lat"],["lon","lat"]] to Cesium Cartesian positions
      const coords = data.boundary.flatMap(([lon, lat]) => [lon, lat]);
      setPolygonPositions(coords);
    } catch (err) {
      console.error(err);
      alert("Error fetching land");
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-[#4e342e] mb-4">3D Verify Land</h1>

      {/* Input + Search */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={titleNumber}
          onChange={(e) => setTitleNumber(e.target.value)}
          placeholder="Enter Title Number e.g. NKR/1001"
          className="border p-3 rounded w-80"
        />
        <button
          onClick={handleSearch}
          className="bg-[#4e342e] text-white px-6 py-3 rounded"
        >
          Search
        </button>
      </div>

      {/* LAND INFO CARD */}
      {landData && (
        <div className="p-4 bg-white shadow-md border rounded mb-4">
          <h2 className="text-xl font-bold text-[#4e342e] mb-2">
            Land Details
          </h2>
          <p>
            <strong>Title:</strong> {landData.title_number}
          </p>
          <p>
            <strong>Owner:</strong> {landData.owner_name}
          </p>
          <p>
            <strong>Size:</strong> {landData.dimensions}
          </p>
          <p>
            <strong>Location:</strong> {landData.location}
          </p>
          <p>
            <strong>Verified:</strong> {landData.is_verified ? "Yes" : "No"}
          </p>
          <p>
            <strong>Owner Phone:</strong> {landData.owner_phone}
          </p>
          <p>
            <strong>Owner Email:</strong> {landData.owner_email}
          </p>
          <p>
            <strong>Blockchain Hash:</strong> {landData.blockchain_hash}
          </p>
        </div>
      )}

      {/* CESIUM VIEWER */}
      <div style={{ width: "100%", height: "500px" }}>
        <Viewer
          style={{ width: "100%", height: "100%" }}
          terrain={Cesium.Terrain.fromWorldTerrain()}
          baseLayerPicker={false}
          geocoder={false}
          navigationHelpButton={false}
          timeline={false}
          animation={false}
          imageryProvider={new Cesium.IonImageryProvider({ assetId: 3 })}
        >
          {/* Draw polygon if available */}
          {polygonPositions.length > 0 && (
            <Entity
              name="Land Parcel"
              polygon={new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray(polygonPositions)
              )}
            >
              <PolygonGraphics
                material={Cesium.Color.GREEN.withAlpha(0.5)}
                outline={true}
                outlineColor={Cesium.Color.BLACK}
              />
            </Entity>
          )}
        </Viewer>
      </div>
    </div>
  );
}
