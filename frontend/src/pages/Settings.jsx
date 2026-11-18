import { useState } from "react";

import {
  APPLICATION_NAME,
  APPLICATION_VERSION,
  LOCATION_STORAGE_KEY,
} from "../services/applicationConfig";
import { RISK_CATEGORIES, RISK_SCORING_RULES } from "../services/locationRisk";
import { MAP_CONFIGURATION } from "../services/mapConfiguration";

function Settings({ locations, storageStatus, onResetLocations }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const storageSize = new Blob([JSON.stringify(locations)]).size;
  const conditionRules = Object.entries(RISK_SCORING_RULES.conditionBaselines)
    .map(([condition, points]) => `${condition}: ${points}`)
    .join(" · ");
  const typeRules = Object.entries(RISK_SCORING_RULES.typeAdjustments)
    .map(([type, points]) => `${type}: +${points}`)
    .join(" · ");
  const riskBands = RISK_CATEGORIES
    .map((category, index) => {
      const maxScore = RISK_CATEGORIES[index + 1]
        ? RISK_CATEGORIES[index + 1].minScore - 1
        : 100;
      return `${category.label} ${category.minScore}–${maxScore}`;
    })
    .join(" · ");

  function downloadLocationData() {
    const data = JSON.stringify(locations, null, 2);
    const url = URL.createObjectURL(
      new Blob([data], { type: "application/json;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "ecodrain-locations.json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function confirmLocationReset() {
    onResetLocations();
    setConfirmReset(false);
  }

  return (
    <div className="settings-page" id="system-status">
      <header className="dashboard-header settings-header">
        <div>
          <p className="eyebrow">SYSTEM</p>
          <h1>Settings</h1>
          <p className="header-description">
            Application information, data management, and active assessment configuration.
          </p>
        </div>
        <span className="system-status">
          <span className="status-dot" aria-hidden="true" />
          System active
        </span>
      </header>

      <section className="settings-panel" aria-labelledby="system-info-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">APPLICATION</p>
            <h2 id="system-info-title">System information</h2>
          </div>
        </div>
        <dl className="settings-info-grid">
          <div className="settings-info-item">
            <dt>Application</dt>
            <dd>{APPLICATION_NAME} Campus Environmental Monitoring</dd>
          </div>
          <div className="settings-info-item">
            <dt>Version</dt>
            <dd>{APPLICATION_VERSION}</dd>
          </div>
          <div className="settings-info-item">
            <dt>Status</dt>
            <dd><span className="settings-status-value">Active</span></dd>
          </div>
        </dl>
      </section>

      <section className="settings-panel" aria-labelledby="storage-settings-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LOCATION DATA</p>
            <h2 id="storage-settings-title">Data storage & management</h2>
          </div>
        </div>
        <dl className="settings-info-grid">
          <div className="settings-info-item">
            <dt>Storage</dt>
            <dd>Browser localStorage</dd>
          </div>
          <div className="settings-info-item">
            <dt>Storage key</dt>
            <dd><code>{LOCATION_STORAGE_KEY}</code></dd>
          </div>
          <div className="settings-info-item">
            <dt>Registered locations</dt>
            <dd>{locations.length}</dd>
          </div>
          <div className="settings-info-item">
            <dt>Estimated data size</dt>
            <dd>{storageSize.toLocaleString()} bytes</dd>
          </div>
        </dl>
        <p className={`settings-storage-message ${storageStatus.tone}`} role="status">
          {storageStatus.message}
        </p>
        <div className="settings-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={downloadLocationData}
            disabled={!locations.length}
          >
            Download location backup
          </button>
          <button
            type="button"
            className="settings-danger-button"
            onClick={() => setConfirmReset(true)}
            disabled={!locations.length}
          >
            Delete all locations
          </button>
        </div>
        <p className="settings-help">
          Download a JSON backup or permanently clear all saved locations from this browser.
        </p>
      </section>

      <section className="settings-panel" aria-labelledby="risk-config-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ENVIRONMENTAL ASSESSMENT</p>
            <h2 id="risk-config-title">Risk assessment configuration</h2>
            <p>These are the active rules used in the dashboard, reports, table, and map.</p>
          </div>
        </div>
        <dl className="settings-info-grid settings-risk-grid">
          <div className="settings-info-item">
            <dt>Condition baseline</dt>
            <dd>{conditionRules}</dd>
          </div>
          <div className="settings-info-item">
            <dt>Location type adjustments</dt>
            <dd>{typeRules}</dd>
          </div>
          <div className="settings-info-item">
            <dt>Unknown condition baseline</dt>
            <dd>{RISK_SCORING_RULES.unknownConditionBaseline} points</dd>
          </div>
          <div className="settings-info-item">
            <dt>Risk category thresholds</dt>
            <dd>{riskBands}</dd>
          </div>
        </dl>
        <p className="settings-help">
          Scores are calculated from registered location information only; no environmental sensor readings are available.
        </p>
      </section>

      <section className="settings-panel" aria-labelledby="map-config-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">GEOSPATIAL VIEW</p>
            <h2 id="map-config-title">Map configuration</h2>
          </div>
          <a className="settings-inline-link" href="#campus-map">Open campus map</a>
        </div>
        <dl className="settings-info-grid">
          <div className="settings-info-item">
            <dt>Map tiles</dt>
            <dd>OpenStreetMap</dd>
          </div>
          <div className="settings-info-item">
            <dt>Initial center</dt>
            <dd>{MAP_CONFIGURATION.center[0]}, {MAP_CONFIGURATION.center[1]}</dd>
          </div>
          <div className="settings-info-item">
            <dt>Initial zoom</dt>
            <dd>{MAP_CONFIGURATION.initialZoom}</dd>
          </div>
          <div className="settings-info-item">
            <dt>Location focus zoom</dt>
            <dd>{MAP_CONFIGURATION.locationFocusZoom}</dd>
          </div>
        </dl>
      </section>

      {confirmReset && (
        <div
          className="location-edit-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmReset(false);
            }
          }}
        >
          <section
            className="location-edit-dialog reset-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-locations-title"
            aria-describedby="reset-locations-description"
          >
            <div className="location-details-content">
              <p className="eyebrow">CONFIRM DATA RESET</p>
              <h2 id="reset-locations-title">Delete all registered locations?</h2>
              <p id="reset-locations-description">
                This permanently deletes {locations.length} saved location{locations.length === 1 ? "" : "s"} from this browser. This action cannot be undone.
              </p>
              <div className="form-actions reset-confirm-actions">
                <button
                  type="button"
                  className="settings-danger-button"
                  onClick={confirmLocationReset}
                >
                  Yes, delete all locations
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setConfirmReset(false)}
                  autoFocus
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Settings;
