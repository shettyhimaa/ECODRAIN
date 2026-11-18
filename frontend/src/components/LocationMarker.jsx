import { Marker, Popup } from "react-leaflet";

import L from "leaflet";
import { assessLocationRisk } from "../services/locationRisk";

function LocationMarker({ location }) {
  const { score, category } = assessLocationRisk(location);

  const icon = L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${category.color};
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 1px 5px #555;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
    >
      <Popup>
        <h3>{location.name}</h3>
        <p>ID: {location.id}</p>
        <p>Type: {location.type}</p>
        <p>Condition: {location.condition}</p>
        <p>Environmental risk: {category.label} ({score}/100)</p>
        <p>Latitude: {location.latitude.toFixed(6)}</p>
        <p>Longitude: {location.longitude.toFixed(6)}</p>
        <p>{location.description}</p>
      </Popup>
    </Marker>
  );
}

export default LocationMarker;