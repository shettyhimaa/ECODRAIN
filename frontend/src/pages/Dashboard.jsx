import { useEffect, useRef, useState } from "react";

import CampusMap from "../components/CampusMap";
import LocationTable from "../components/LocationTable";
import Settings from "./Settings";
import Reports from "./Reports";
import { assessLocationRisk, RISK_CATEGORIES } from "../services/locationRisk";
import {
  APPLICATION_NAME,
  APPLICATION_VERSION,
  LOCATION_STORAGE_KEY,
} from "../services/applicationConfig";

import "../styles/Dashboard.css";

const drainageTypes = new Set(["Drainage Point", "Drainage Outlet"]);
const waterBodyTypes = new Set(["Water Body", "Pond"]);

function readStoredLocations() {
  try {
    const savedLocations = window.localStorage.getItem(LOCATION_STORAGE_KEY);

    if (!savedLocations) {
      return {
        locations: [],
        message: "No saved locations yet. New registrations are stored in this browser.",
        tone: "neutral",
      };
    }

    const parsedLocations = JSON.parse(savedLocations);

    if (!Array.isArray(parsedLocations)) {
      throw new Error("The saved location data is not a list.");
    }

    const seenIds = new Set();
    let skippedCount = 0;
    const locations = parsedLocations.filter((location) => {
      const validLocation =
        location &&
        typeof location.id === "string" &&
        typeof location.name === "string" &&
        typeof location.type === "string" &&
        typeof location.condition === "string" &&
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude);

      if (!validLocation || seenIds.has(location.id)) {
        skippedCount += 1;
        return false;
      }

      seenIds.add(location.id);
      return true;
    });

    return {
      locations,
      message: skippedCount
        ? `Loaded ${locations.length} saved location${locations.length === 1 ? "" : "s"}; skipped ${skippedCount} invalid or duplicate record${skippedCount === 1 ? "" : "s"}.`
        : `Loaded ${locations.length} saved location${locations.length === 1 ? "" : "s"} from this browser.`,
      tone: skippedCount ? "warning" : "success",
    };
  } catch (error) {
    return {
      locations: [],
      message: `Saved locations could not be loaded: ${error.message}`,
      tone: "error",
    };
  }
}

function Dashboard() {
  const [initialStorage] = useState(readStoredLocations);
  const [locations, setLocations] = useState(initialStorage.locations);
  const locationsRef = useRef(initialStorage.locations);
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const [currentHash, setCurrentHash] = useState(
    () => window.location.hash || "#overview",
  );
  const [storageStatus, setStorageStatus] = useState({
    message: initialStorage.message,
    tone: initialStorage.tone,
  });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    function syncCurrentHash() {
      setCurrentHash(window.location.hash || "#overview");
    }

    window.addEventListener("hashchange", syncCurrentHash);
    return () => window.removeEventListener("hashchange", syncCurrentHash);
  }, []);

  useEffect(() => {
    const targetId = currentHash.slice(1);
    if (!targetId) {
      return;
    }

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
    });
  }, [currentHash]);

  function persistLocations(nextLocations) {
    try {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(nextLocations));
      setStorageStatus({
        message: `Saved ${nextLocations.length} location${nextLocations.length === 1 ? "" : "s"} in this browser.`,
        tone: "success",
      });
    } catch (error) {
      setStorageStatus({
        message: `Changes are visible for this session but could not be saved: ${error.message}`,
        tone: "error",
      });
    }
  }

  function commitLocations(nextLocations, actionMessage) {
    locationsRef.current = nextLocations;
    setLocations(nextLocations);
    persistLocations(nextLocations);
    setFeedback(actionMessage);
  }

  function handleAddLocation(location) {
    const currentLocations = locationsRef.current;

    if (currentLocations.some((current) => current.id === location.id)) {
      setFeedback("This location is already registered.");
      return;
    }

    commitLocations(
      [...currentLocations, location],
      `${location.name} was registered successfully.`,
    );
  }

  function handleDeleteLocation(locationId) {
    const currentLocations = locationsRef.current;
    const nextLocations = currentLocations.filter(
      (location) => location.id !== locationId,
    );

    if (nextLocations.length === currentLocations.length) {
      return;
    }

    if (focusedLocation?.id === locationId) {
      setFocusedLocation(null);
    }

    const removedLocation = currentLocations.find(
      (location) => location.id === locationId,
    );
    commitLocations(
      nextLocations,
      `${removedLocation.name} was removed successfully.`,
    );
  }

  function handleUpdateLocation(updatedLocation) {
    const currentLocations = locationsRef.current;
    const existingLocation = currentLocations.find(
      (location) => location.id === updatedLocation.id,
    );

    if (!existingLocation) {
      return;
    }

    const nextLocations = currentLocations.map((location) =>
      location.id === existingLocation.id
        ? { ...location, ...updatedLocation, id: existingLocation.id }
        : location,
    );
    const savedLocation = nextLocations.find(
      (location) => location.id === existingLocation.id,
    );

    if (focusedLocation?.id === savedLocation.id) {
      setFocusedLocation(savedLocation);
    }

    commitLocations(
      nextLocations,
      `${savedLocation.name} was updated successfully.`,
    );
  }

  function handleViewLocation(location) {
    setFocusedLocation(location);
    setFocusRequest((request) => request + 1);
  }

  function handleRetrySave() {
    persistLocations(locationsRef.current);
  }

  function handleResetLocations() {
    if (locationsRef.current.length === 0) {
      return;
    }

    setFocusedLocation(null);
    commitLocations([], "All registered locations were deleted.");
  }

  const totalLocations = locations.length;
  const drainagePoints = locations.filter((location) =>
    drainageTypes.has(location.type),
  ).length;
  const waterBodies = locations.filter((location) =>
    waterBodyTypes.has(location.type),
  ).length;
  const otherLocations = locations.filter(
    (location) =>
      !drainageTypes.has(location.type) && !waterBodyTypes.has(location.type),
  ).length;
  const criticalLocations = locations.filter(
    (location) => location.condition === "Critical",
  ).length;
  const riskCounts = Object.fromEntries(
    RISK_CATEGORIES.map((category) => [category.key, 0]),
  );
  locations.forEach((location) => {
    riskCounts[assessLocationRisk(location).category.key] += 1;
  });

  const statistics = [
    {
      label: "Total locations",
      value: totalLocations,
      detail: "Registered campus sites",
      accent: "green",
    },
    {
      label: "Drainage points",
      value: drainagePoints,
      detail: "Points and outlets",
      accent: "blue",
    },
    {
      label: "Water bodies",
      value: waterBodies,
      detail: "Water bodies and ponds",
      accent: "aqua",
    },
    {
      label: "Other locations",
      value: otherLocations,
      detail: "Additional mapped sites",
      accent: "gold",
    },
    {
      label: "Critical locations",
      value: criticalLocations,
      detail: "Require immediate attention",
      accent: "red",
    },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <a className="logo" href="#overview" aria-label="ECODRAIN dashboard">
          <span className="logo-mark" aria-hidden="true">
            E
          </span>
          <span>{APPLICATION_NAME}</span>
        </a>

        <p className="sidebar-label">OVERVIEW</p>
        <nav aria-label="Main navigation">
          <a className={currentHash === "#overview" ? "active" : ""} href="#overview">
            <span aria-hidden="true">▦</span> Dashboard
          </a>
        </nav>

        <p className="sidebar-label">MONITORING</p>
        <nav aria-label="Monitoring navigation">
          <a className={currentHash === "#campus-map" ? "active" : ""} href="#campus-map">
            <span aria-hidden="true">⌖</span> Campus map
          </a>
          <a className={currentHash === "#registered-locations" ? "active" : ""} href="#registered-locations">
            <span aria-hidden="true">▤</span> Locations
          </a>
          <a className={currentHash === "#reports" ? "active" : ""} href="#reports">
            <span aria-hidden="true">▧</span> Reports
          </a>
        </nav>

        <p className="sidebar-label">SYSTEM</p>
        <nav aria-label="System navigation">
          <a className={currentHash === "#system-status" ? "active" : ""} href="#system-status">
            <span aria-hidden="true">⚙</span> Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <p>{APPLICATION_NAME} <span>v{APPLICATION_VERSION}</span></p>
          <p>Smart campus environmental monitoring</p>
        </div>
      </aside>

      <main className="main-content">
        {currentHash === "#reports" ? (
          <Reports locations={locations} />
        ) : currentHash === "#system-status" ? (
          <Settings
            locations={locations}
            storageStatus={storageStatus}
            onResetLocations={handleResetLocations}
          />
        ) : (
        <div id="overview">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">CAMPUS MONITORING</p>
            <h1>Campus overview</h1>
            <p className="header-description">
              Monitor water bodies and drainage across your campus.
            </p>
          </div>
          <div className="system-status">
            <span className="status-dot" aria-hidden="true" />
            System active
          </div>
        </header>

        <div
          className={`persistence-status ${storageStatus.tone}`}
          role={storageStatus.tone === "error" ? "alert" : "status"}
        >
          <span>{storageStatus.message}</span>
          {storageStatus.tone === "error" && (
            <button type="button" className="retry-button" onClick={handleRetrySave}>
              Retry save
            </button>
          )}
        </div>

        {feedback && (
          <p className="action-feedback" role="status">
            <span aria-hidden="true">✓</span> {feedback}
          </p>
        )}

        <section className="stats-grid" aria-label="Location statistics">
          {statistics.map((statistic) => (
            <article
              className={`stat-card ${statistic.accent}`}
              key={statistic.label}
            >
              <p className="stat-label">{statistic.label}</p>
              <p className="stat-value">{statistic.value}</p>
              <p className="stat-detail">{statistic.detail}</p>
            </article>
          ))}
        </section>

        <section className="risk-overview" aria-labelledby="risk-overview-title">
          <div className="risk-overview-heading">
            <div>
              <p className="eyebrow">ENVIRONMENTAL ASSESSMENT</p>
              <h2 id="risk-overview-title">Risk overview</h2>
              <p>
                Based on registered location condition and type; no sensor readings are available.
              </p>
            </div>
            <span className="risk-assessed-count">
              {locations.length} {locations.length === 1 ? "location" : "locations"} assessed
            </span>
          </div>
          <div
            className="risk-distribution-bar"
            role="img"
            aria-label={RISK_CATEGORIES.map(
              (category) => `${category.label}: ${riskCounts[category.key]}`,
            ).join(", ")}
          >
            {RISK_CATEGORIES.map((category) => (
              <span
                key={category.key}
                className={`risk-distribution-segment risk-${category.key}`}
                style={{
                  width: locations.length
                    ? `${(riskCounts[category.key] / locations.length) * 100}%`
                    : "0%",
                }}
              />
            ))}
          </div>
          <div className="risk-count-grid">
            {RISK_CATEGORIES.map((category) => (
              <article className="risk-count-card" key={category.key}>
                <span className={`risk-badge risk-${category.key}`}>
                  {category.label}
                </span>
                <strong>{riskCounts[category.key]}</strong>
                <span className="risk-count-caption">locations</span>
              </article>
            ))}
          </div>
          <p className="risk-method-note">
            Scoring: condition baseline (Normal 10, Needs Monitoring 40, Critical 80), plus 10 for drainage types or 5 for water bodies. Bands: Low 0–24, Moderate 25–49, High 50–74, Critical 75–100.
          </p>
        </section>

        <section className="map-section" id="campus-map">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GEOSPATIAL VIEW</p>
              <h2>Campus map</h2>
              <p>Register and explore mapped water and drainage locations.</p>
            </div>
            <span className="location-count">
              {totalLocations} mapped
            </span>
          </div>

          <CampusMap
            locations={locations}
            onAddLocation={handleAddLocation}
            focusLocation={focusedLocation}
            focusRequest={focusRequest}
          />
        </section>

        <LocationTable
          locations={locations}
          onDeleteLocation={handleDeleteLocation}
          onUpdateLocation={handleUpdateLocation}
          onViewLocation={handleViewLocation}
        />
        </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard; 
