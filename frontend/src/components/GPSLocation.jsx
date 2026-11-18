import { useEffect } from "react";
import { useMap } from "react-leaflet";

function GPSLocation({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(
        [location.latitude, location.longitude],
        19,
        { duration: 1.5 }
      );
    }
  }, [location, map]);

  return null;
}

export default GPSLocation;