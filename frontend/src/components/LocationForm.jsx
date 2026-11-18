import { useState } from "react";

function LocationForm({ coordinates, onSave, onCancel }) {

  const [formData, setFormData] = useState({
    name: "",
    type: "Drainage Point",
    condition: "Normal",
    description: ""
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newLocation = {
      id: `LOC-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`,
      ...formData,
      name: formData.name.trim(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      createdAt: new Date().toISOString()
    };

    onSave(newLocation);
  }

  return (
    <form className="location-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">NEW RECORD</p>
          <h3>Register a location</h3>
        </div>
        <p className="form-coordinates">
          {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
        </p>
      </div>

      <label htmlFor="location-name">Location name</label>
      <input
        id="location-name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter location name"
        minLength={2}
        required
      />

      <div className="form-fields-row">
        <div>
          <label htmlFor="location-type">Location type</label>
      <select
        id="location-type"
        name="type"
        value={formData.type}
        onChange={handleChange}
      >
        <option>Drainage Point</option>
        <option>Water Body</option>
        <option>Drainage Outlet</option>
        <option>Tank</option>
        <option>Pond</option>
      </select>
        </div>
        <div>
          <label htmlFor="location-condition">Condition</label>
          <select
            id="location-condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
          >
            <option>Normal</option>
            <option>Needs Monitoring</option>
            <option>Critical</option>
          </select>
        </div>
      </div>

      <label htmlFor="location-description">Description</label>
      <textarea
        id="location-description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe the location"
      />

      <div className="form-actions">
        <button type="submit" className="button-primary">Save location</button>
        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default LocationForm;