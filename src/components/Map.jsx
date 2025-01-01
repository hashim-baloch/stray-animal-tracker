import { useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import L from "leaflet";
import DrawControls from "./DrawControls";
import MapControls from "./MapControls";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Initialize Leaflet Draw handlers
L.drawLocal.draw.handlers = {
  ...L.drawLocal.draw.handlers,
  circle: {
    tooltip: {
      start: "Click and drag to draw circle.",
      end: "Release mouse to finish drawing.",
    },
    radius: "Radius",
  },
  polygon: {
    tooltip: {
      start: "Click to start drawing shape.",
      cont: "Click to continue drawing shape.",
      end: "Click first point to close this shape.",
    },
  },
  rectangle: {
    tooltip: {
      start: "Click and drag to draw rectangle.",
    },
  },
  marker: {
    tooltip: {
      start: "Click map to place marker.",
    },
  },
};

function Map() {
  const [map, setMap] = useState(null);
  const [mapLayers, setMapLayers] = useState([]);
  const featureGroupRef = useRef(null);

  const handleLayerCreated = useCallback((layer) => {
    if (featureGroupRef.current) {
      featureGroupRef.current.addLayer(layer);
      setMapLayers((prevLayers) => [...prevLayers, layer]);
    }
  }, []);

  const handleLayersDeleted = useCallback(() => {
    if (featureGroupRef.current) {
      const layers = featureGroupRef.current.getLayers();
      setMapLayers(Array.from(layers));
    }
  }, []);

  const saveMap = useCallback(() => {
    const data = mapLayers.map((layer) => {
      const geoJSON = layer.toGeoJSON();
      if (layer instanceof L.Circle) {
        geoJSON.properties = {
          ...geoJSON.properties,
          radius: layer.getRadius(),
          type: "circle",
        };
      }
      return geoJSON;
    });
    localStorage.setItem("mapData", JSON.stringify(data));
    alert("Map data saved successfully!");
  }, [mapLayers]);

  const loadMap = useCallback(() => {
    try {
      const savedData = localStorage.getItem("mapData");
      if (!savedData) {
        alert("No saved map data found");
        return;
      }

      const data = JSON.parse(savedData);
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();

        data.forEach((item) => {
          let layer;
          if (item.properties && item.properties.type === "circle") {
            const coords = item.geometry.coordinates;
            layer = L.circle([coords[1], coords[0]], {
              radius: item.properties.radius,
            });
          } else {
            layer = L.geoJSON(item);
            // Extract the actual layer from the GeoJSON wrapper
            layer = layer.getLayers()[0];
          }
          featureGroupRef.current.addLayer(layer);
        });

        setMapLayers(featureGroupRef.current.getLayers());
        alert("Map data loaded successfully!");
      }
    } catch (error) {
      console.error("Error loading map data:", error);
      alert("Error loading map data");
    }
  }, []);

  return (
    <div className="map-wrapper">
      <MapControls onSave={saveMap} onLoad={loadMap} />
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
        ref={setMap}
      >
        <TileLayer
          url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup ref={featureGroupRef}>
          {map && (
            <DrawControls
              map={map}
              featureGroupRef={featureGroupRef}
              onLayerCreated={handleLayerCreated}
              onLayersDeleted={handleLayersDeleted}
            />
          )}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}

export default Map;
