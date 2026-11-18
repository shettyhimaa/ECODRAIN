import { useState } from "react";

import LocationDetailsModal from "./LocationDetailsModal";
import LocationEditModal from "./LocationEditModal";
import { assessLocationRisk } from "../services/locationRisk";

function LocationTable({
  locations,
  onDeleteLocation,
  onUpdateLocation,
  onViewLocation,
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Locations");
  const [editingLocation, setEditingLocation] = useState(null);
  const [detailsLocation, setDetailsLocation] = useState(null);
  const currentDetailsLocation = detailsLocation
    ? locations.find((location) => location.id === detailsLocation.id)
    : null;
  const normalizedSearch = search.trim().toLowerCase();
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      !normalizedSearch ||
      location.name.toLowerCase().includes(normalizedSearch) ||
      location.id.toLowerCase().includes(normalizedSearch);
    const matchesType =
      typeFilter === "All Locations" ||
      (typeFilter === "Other"
        ? !["Drainage Point", "Drainage Outlet", "Water Body", "Pond"].includes(location.type)
        : location.type === typeFilter);

    return matchesSearch && matchesType;
  });

  return (
    <section className="location-table-container" id="registered-locations">
      <div className="table-heading">
        <div>
          <p className="eyebrow">LOCATION REGISTER</p>
          <h2>Registered locations</h2>
        </div>
        <span className="location-count" aria-live="polite">
          {filteredLocations.length === locations.length
            ? `${locations.length} ${locations.length === 1 ? "location" : "locations"}`
            : `${filteredLocations.length} of ${locations.length} locations`}
        </span>
      </div>

      {locations.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">⌖</span>
          <h3>Your location register is empty</h3>
          <p>Select a point on the campus map to add a drainage point or water resource.</p>
        </div>
      ) : (
        <>
          <div className="location-controls">
            <div className="location-search">
              <label htmlFor="location-search">Search locations</label>
              <div className="location-search-field">
                <input
                  id="location-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or location ID"
                />
                {search && (
                  <button
                    type="button"
                    className="clear-search-button"
                    onClick={() => setSearch("")}
                    aria-label="Clear location search"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="location-filter">
              <label htmlFor="location-type-filter">Filter by type</label>
              <select
                id="location-type-filter"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option>All Locations</option>
                <option>Drainage Point</option>
                <option>Drainage Outlet</option>
                <option>Water Body</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          {filteredLocations.length === 0 ? (
            <div className="location-no-results" role="status">
              <h3>No matching locations</h3>
              <p>Try another name, ID, or location type.</p>
            </div>
          ) : (
          <div className="table-wrapper">
            <table className="location-table">
            <thead>
              <tr>
                <th scope="col">Location ID</th>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Condition</th>
                <th scope="col">Risk</th>
                <th scope="col">Latitude</th>
                <th scope="col">Longitude</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((location) => {
                const { score, category } = assessLocationRisk(location);
                const shortId = location.id.length > 18
                  ? `${location.id.slice(0, 9)}…${location.id.slice(-6)}`
                  : location.id;

                return (
                  <tr key={location.id}>
                    <td data-label="Location ID">
                      <code className="location-id" title={location.id}>
                        {shortId}
                      </code>
                    </td>
                    <td className="location-name-cell" data-label="Name">
                      <button
                        type="button"
                        className="location-name-link"
                        onClick={() => setDetailsLocation(location)}
                        aria-label={`View details for ${location.name}`}
                      >
                      {location.name}
                      </button>
                    </td>
                    <td data-label="Type">{location.type}</td>
                    <td data-label="Condition">
                      <span className={`condition-badge ${location.condition.toLowerCase().replaceAll(" ", "-")}`}>
                        {location.condition}
                      </span>
                    </td>
                    <td className="risk-cell" data-label="Risk">
                      <span className={`risk-badge risk-${category.key}`}>
                        {category.label}
                      </span>
                      <span className="risk-score">{score}/100</span>
                    </td>
                    <td className="coordinate-cell" data-label="Latitude">
                      {location.latitude.toFixed(6)}
                    </td>
                    <td className="coordinate-cell" data-label="Longitude">
                      {location.longitude.toFixed(6)}
                    </td>
                    <td className="location-actions" data-label="Actions">
                      <a
                        className="view-map-link"
                        href="#campus-map"
                        aria-label={`View ${location.name} on the campus map`}
                        onClick={() => onViewLocation(location)}
                      >
                        View map
                      </a>
                      <button
                        type="button"
                        className="edit-location-button"
                        onClick={() => setEditingLocation(location)}
                        aria-label={`Edit ${location.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-location-button"
                        onClick={() => onDeleteLocation(location.id)}
                        aria-label={`Delete ${location.name}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
          )}
        </>
      )}

      {editingLocation && (
        <LocationEditModal
          location={editingLocation}
          onCancel={() => setEditingLocation(null)}
          onSave={(updatedLocation) => {
            onUpdateLocation(updatedLocation);
            setEditingLocation(null);
          }}
        />
      )}
      {currentDetailsLocation && (
        <LocationDetailsModal
          location={currentDetailsLocation}
          onClose={() => setDetailsLocation(null)}
          onUpdateStatus={(condition) =>
            onUpdateLocation({ ...currentDetailsLocation, condition })
          }
        />
      )}
    </section>
  );
}

export default LocationTable;
