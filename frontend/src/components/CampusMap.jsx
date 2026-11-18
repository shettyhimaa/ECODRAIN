import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import GPSLocation from "./GPSLocation";
import LocationForm from "./LocationForm";
import LocationMarker from "./LocationMarker";
import { MAP_CONFIGURATION } from "../services/mapConfiguration";

function MapLocationFocus({ location, request }) {
  const map = useMap();
  const latitude = location?.latitude;
  const longitude = location?.longitude;

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    map.setView(
      [latitude, longitude],
      Math.max(map.getZoom(), MAP_CONFIGURATION.locationFocusZoom),
      {
      animate: true,
      },
    );
  }, [latitude, longitude, map, request]);

  return null;
}

function LocationSelector({ onSelect }) {

  useMapEvents({
    click(e) {
      onSelect({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    }
  });

  return null;
}

function CampusMap({ locations, onAddLocation, focusLocation, focusRequest }) {

  const [selectedCoordinates, setSelectedCoordinates] =
    useState(null);

  const [showForm, setShowForm] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [notice, setNotice] = useState("");

  function handleMapSelect(coordinates) {
    setSelectedCoordinates(coordinates);
    setShowForm(true);
    setNotice("");
  }

  function handleSave(location) {
    onAddLocation(location);
    setShowForm(false);
    setSelectedCoordinates(null);
  }

  function getCurrentLocation() {

    if (!navigator.geolocation) {
      setNotice("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    setNotice("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setGpsLocation(coordinates);
        handleMapSelect(coordinates);
        setIsLocating(false);
        setNotice("Current position found. Complete the form to register it.");
      },
      () => {
        setIsLocating(false);
        setNotice("Unable to retrieve your location. Check location permissions and try again.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="campus-map">
      <div className="map-toolbar">
        <p>Click anywhere on the map to choose a location.</p>
        <div className="map-actions">
          <button
            type="button"
            className="button-primary"
            onClick={getCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? "Locating..." : "Use my current location"}
          </button>
          {showForm && (
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                setShowForm(false);
                setSelectedCoordinates(null);
                setNotice("");
              }}
            >
              Cancel registration
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p className="map-notice" role="status">
          {notice}
        </p>
      )}

      {showForm && selectedCoordinates && (
        <LocationForm
          coordinates={selectedCoordinates}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="map-canvas">
        <MapContainer
          center={MAP_CONFIGURATION.center}
          zoom={MAP_CONFIGURATION.initialZoom}
          style={{ height: "100%", width: "100%" }}
        >

          <TileLayer
            attribution={MAP_CONFIGURATION.attribution}
            url={MAP_CONFIGURATION.tileUrl}
          />

          <Marker position={MAP_CONFIGURATION.center}>
            <Popup>Ecodrain – BMSIT&M Campus</Popup>
          </Marker>

          <LocationSelector onSelect={handleMapSelect} />

          <GPSLocation location={gpsLocation} />
          <MapLocationFocus location={focusLocation} request={focusRequest} />

          {locations.map((location) => (
            <LocationMarker
              key={location.id}
              location={location}
            />
          ))}

        </MapContainer>
      </div>

      {locations.length === 0 && (
        <p className="map-empty-hint">
          No locations mapped yet. Select a point on the map to get started.
        </p>
      )}

    </div>
  );
}

export default CampusMap;