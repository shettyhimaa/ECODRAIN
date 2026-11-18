import { useState } from "react";

const conditions = ["Normal", "Needs Monitoring", "Critical"];

function LocationDetailsModal({ location, onClose, onUpdateStatus }) {
  const [condition, setCondition] = useState(location.condition);
  const [statusSaved, setStatusSaved] = useState(false);

  function handleStatusSubmit(event) {
    event.preventDefault();
    if (condition === location.condition) {
      return;
    }

    onUpdateStatus(condition);
    setStatusSaved(true);
  }

  const createdAt = location.createdAt
    ? new Date(location.createdAt).toLocaleString()
    : null;

  return (
    <div
      className="location-edit-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="location-edit-dialog location-details-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-details-title"
      >
        <div className="location-details-content">
          <div className="form-heading">
            <div>
              <p className="eyebrow">LOCATION DETAILS</p>
              <h3 id="location-details-title">{location.name}</h3>
            </div>
            <button
              type="button"
              className="edit-dialog-close"
              onClick={onClose}
              aria-label="Close location details"
            >
              ×
            </button>
          </div>

          <dl className="location-details-grid">
            <div className="location-detail-item full-width">
              <dt>Location ID</dt>
              <dd><code className="location-id details-location-id">{location.id}</code></dd>
            </div>
            <div className="location-detail-item">
              <dt>Name</dt>
              <dd>{location.name}</dd>
            </div>
            <div className="location-detail-item">
              <dt>Location type</dt>
              <dd>{location.type}</dd>
            </div>
            <div className="location-detail-item">
              <dt>Latitude</dt>
              <dd className="coordinate-cell">{location.latitude.toFixed(6)}</dd>
            </div>
            <div className="location-detail-item">
              <dt>Longitude</dt>
              <dd className="coordinate-cell">{location.longitude.toFixed(6)}</dd>
            </div>
            {location.description && (
              <div className="location-detail-item full-width">
                <dt>Description</dt>
                <dd>{location.description}</dd>
              </div>
            )}
            {createdAt && (
              <div className="location-detail-item full-width">
                <dt>Registered</dt>
                <dd>{createdAt}</dd>
              </div>
            )}
          </dl>

          <form className="location-status-form" onSubmit={handleStatusSubmit}>
            <div className="location-status-current">
              <span className="location-status-label">Current condition</span>
              <span className={`condition-badge ${location.condition.toLowerCase().replaceAll(" ", "-")}`}>
                {location.condition}
              </span>
            </div>
            <label htmlFor="details-location-condition">Update condition</label>
            <div className="location-status-controls">
              <select
                id="details-location-condition"
                value={condition}
                onChange={(event) => {
                  setCondition(event.target.value);
                  setStatusSaved(false);
                }}
              >
                {!conditions.includes(condition) && <option>{condition}</option>}
                {conditions.map((value) => <option key={value}>{value}</option>)}
              </select>
              <button
                type="submit"
                className="button-primary"
                disabled={condition === location.condition}
              >
                Save status
              </button>
            </div>
            {statusSaved && (
              <p className="location-status-saved" role="status">
                Condition updated and saved.
              </p>
            )}
          </form>

          <div className="form-actions location-details-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LocationDetailsModal;
