const locationTypes = [
  "Drainage Point",
  "Drainage Outlet",
  "Water Body",
  "Tank",
  "Pond",
];
const conditions = ["Normal", "Needs Monitoring", "Critical"];

function LocationEditModal({ location, onCancel, onSave }) {
  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name")).trim();
    const latitude = Number(formData.get("latitude"));
    const longitude = Number(formData.get("longitude"));

    if (name.length < 2) {
      form.elements.name.setCustomValidity("Enter a name with at least two characters.");
      form.reportValidity();
      return;
    }

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return;
    }

    onSave({
      ...location,
      name,
      type: formData.get("type"),
      condition: formData.get("condition"),
      latitude,
      longitude,
      description: formData.get("description"),
    });
  }

  return (
    <div
      className="location-edit-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        className="location-edit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-location-title"
      >
        <form className="location-form edit-location-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">LOCATION REGISTER</p>
              <h3 id="edit-location-title">Edit location</h3>
            </div>
            <button
              type="button"
              className="edit-dialog-close"
              onClick={onCancel}
              aria-label="Close edit location"
            >
              ×
            </button>
          </div>

          <label htmlFor="edit-location-name">Location name</label>
          <input
            id="edit-location-name"
            name="name"
            defaultValue={location.name}
            minLength={2}
            required
            autoFocus
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />

          <div className="form-fields-row">
            <div>
              <label htmlFor="edit-location-type">Location type</label>
              <select id="edit-location-type" name="type" defaultValue={location.type}>
                {!locationTypes.includes(location.type) && <option>{location.type}</option>}
                {locationTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="edit-location-condition">Condition</label>
              <select id="edit-location-condition" name="condition" defaultValue={location.condition}>
                {!conditions.includes(location.condition) && <option>{location.condition}</option>}
                {conditions.map((condition) => <option key={condition}>{condition}</option>)}
              </select>
            </div>
          </div>

          <div className="form-fields-row">
            <div>
              <label htmlFor="edit-location-latitude">Latitude</label>
              <input
                id="edit-location-latitude"
                name="latitude"
                type="number"
                min="-90"
                max="90"
                step="any"
                defaultValue={location.latitude}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-location-longitude">Longitude</label>
              <input
                id="edit-location-longitude"
                name="longitude"
                type="number"
                min="-180"
                max="180"
                step="any"
                defaultValue={location.longitude}
                required
              />
            </div>
          </div>

          <label htmlFor="edit-location-description">Description</label>
          <textarea
            id="edit-location-description"
            name="description"
            defaultValue={location.description || ""}
            placeholder="Describe the location"
          />

          <div className="form-actions">
            <button type="submit" className="button-primary">Save changes</button>
            <button type="button" className="button-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LocationEditModal;
