// src/components/DashboardMap.jsx
import * as Cesium from "cesium";
import { Viewer, Entity } from "resium";

const { Cartesian3, Color, PolygonHierarchy } = Cesium;

export default function DashboardMap({ lands }) {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Viewer
        full
        homeButton={false}
        navigationHelpButton={false}
        sceneModePicker={false}
        animation={false}
        timeline={false}
        baseLayerPicker={false}
      >
        {lands && lands.length > 0 ? (
          lands.map((land, i) => (
            <Entity
              key={i}
              name={land.title}
              description={`Owner: ${land.owner}<br/>Size: ${land.size}`}
              polygon={{
                hierarchy: new PolygonHierarchy(
                  Cartesian3.fromDegreesArray(land.coordinates)
                ),
                extrudedHeight: 30,
                material: Color.GREEN.withAlpha(0.5),
                outline: true,
                outlineColor: Color.BLACK,
              }}
            />
          ))
        ) : (
          <Entity name="No Land" description="No results found." />
        )}
      </Viewer>
    </div>
  );
}
