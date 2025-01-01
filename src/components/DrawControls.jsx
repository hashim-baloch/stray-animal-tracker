import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

function DrawControls({ map, featureGroupRef, onLayerCreated, onLayersDeleted }) {
  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    // Initialize draw options with proper type definitions
    const drawOptions = {
      position: 'topright',
      draw: {
        polyline: {
          shapeOptions: {
            color: '#f357a1',
            weight: 3
          },
          metric: true
        },
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> shape edges cannot cross!'
          },
          shapeOptions: {
            color: '#bada55'
          },
          metric: true
        },
        circle: {
          shapeOptions: {
            color: '#662d91'
          },
          metric: true,
          showRadius: true
        },
        marker: {
          repeatMode: false
        },
        rectangle: {
          shapeOptions: {
            color: '#4a80f5'
          },
          metric: true
        },
        circlemarker: false
      },
      edit: {
        featureGroup: featureGroupRef.current,
        remove: true,
        edit: {
          selectedPathOptions: {
            maintainColor: true,
            dashArray: '10, 10'
          }
        }
      }
    };

    const drawControl = new L.Control.Draw(drawOptions);
    map.addControl(drawControl);

    const handleDrawCreated = (e) => {
      const layer = e.layer;
      if (layer) {
        onLayerCreated(layer);
      }
    };

    const handleDrawDeleted = () => {
      onLayersDeleted();
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);
    map.on(L.Draw.Event.DELETED, handleDrawDeleted);

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
      map.off(L.Draw.Event.DELETED, handleDrawDeleted);
    };
  }, [map, featureGroupRef, onLayerCreated, onLayersDeleted]);

  return null;
}

export default DrawControls;