import { assessLocationRisk, RISK_CATEGORIES } from "../services/locationRisk";

function escapeCsvCell(value) {
  const text = String(value ?? "");
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function Reports({ locations }) {
  const typeCounts = locations.reduce((counts, location) => {
    counts.set(location.type, (counts.get(location.type) || 0) + 1);
    return counts;
  }, new Map());
  const assessedLocations = locations.map((location) => ({
    ...location,
    risk: assessLocationRisk(location),
  }));
  const riskCounts = Object.fromEntries(
    RISK_CATEGORIES.map((category) => [category.key, 0]),
  );
  let totalRiskScore = 0;
  assessedLocations.forEach(({ risk }) => {
    riskCounts[risk.category.key] += 1;
    totalRiskScore += risk.score;
  });
  const averageRisk = locations.length
    ? Math.round(totalRiskScore / locations.length)
    : null;
  const highestCountCategory = RISK_CATEGORIES.reduce(
    (highest, category) =>
      riskCounts[category.key] > riskCounts[highest.key] ? category : highest,
    RISK_CATEGORIES[0],
  );

  function downloadReport() {
    const header = [
      "Location ID",
      "Name",
      "Type",
      "Condition",
      "Risk Category",
      "Risk Score",
      "Latitude",
      "Longitude",
      "Description",
    ];
    const rows = assessedLocations.map(({ risk, ...location }) => [
      location.id,
      location.name,
      location.type,
      location.condition,
      risk.category.label,
      risk.score,
      location.latitude,
      location.longitude,
      location.description || "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ecodrain-location-risk-report.csv";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="reports-page" id="reports">
      <header className="dashboard-header reports-header">
        <div>
          <p className="eyebrow">CAMPUS MONITORING</p>
          <h1>Environmental reports</h1>
          <p className="header-description">
            A current summary of registered locations and their assessed risk.
          </p>
        </div>
        <button
          type="button"
          className="button-primary report-download-button"
          onClick={downloadReport}
          disabled={!locations.length}
        >
          Download CSV
        </button>
      </header>

      <section className="report-summary-grid" aria-label="Report summary">
        <article className="report-summary-card">
          <span>Total registered locations</span>
          <strong>{locations.length}</strong>
          <small>{locations.length} assessed from location information</small>
        </article>
        <article className="report-summary-card">
          <span>Average risk score</span>
          <strong>{averageRisk === null ? "—" : `${averageRisk}/100`}</strong>
          <small>Condition and location-type based</small>
        </article>
        <article className="report-summary-card">
          <span>Most common risk level</span>
          <strong>
            {locations.length ? highestCountCategory.label : "—"}
          </strong>
          <small>
            {locations.length
              ? `${riskCounts[highestCountCategory.key]} location${riskCounts[highestCountCategory.key] === 1 ? "" : "s"}`
              : "No assessed locations"}
          </small>
        </article>
      </section>

      <section className="report-panel" aria-labelledby="report-type-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">REGISTER BREAKDOWN</p>
            <h2 id="report-type-heading">Locations by type</h2>
          </div>
          <span className="location-count">{typeCounts.size} types</span>
        </div>
        {typeCounts.size ? (
          <div className="report-type-grid">
            {[...typeCounts.entries()]
              .sort(([first], [second]) => first.localeCompare(second))
              .map(([type, count]) => (
                <article className="report-type-card" key={type}>
                  <span>{type}</span>
                  <strong>{count}</strong>
                </article>
              ))}
          </div>
        ) : (
          <p className="report-empty">No locations have been registered yet.</p>
        )}
      </section>

      <section className="report-panel" aria-labelledby="report-risk-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ENVIRONMENTAL ASSESSMENT</p>
            <h2 id="report-risk-heading">Risk distribution</h2>
            <p>
              Based on registered location condition and type; no sensor readings are available.
            </p>
          </div>
          <span className="risk-assessed-count">
            {locations.length} {locations.length === 1 ? "location" : "locations"} assessed
          </span>
        </div>
        <div
          className="risk-distribution-bar report-distribution-bar"
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
          {averageRisk !== null && ` Average campus risk score: ${averageRisk}/100.`}
        </p>
      </section>

      <section className="report-panel" aria-labelledby="report-locations-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LOCATION REGISTER</p>
            <h2 id="report-locations-heading">Registered locations</h2>
          </div>
          <span className="location-count">
            {locations.length} {locations.length === 1 ? "location" : "locations"}
          </span>
        </div>
        {assessedLocations.length ? (
          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th scope="col">Location</th>
                  <th scope="col">Type</th>
                  <th scope="col">Condition</th>
                  <th scope="col">Risk</th>
                  <th scope="col">Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {assessedLocations.map(({ risk, ...location }) => (
                  <tr key={location.id}>
                    <td>
                      <strong>{location.name}</strong>
                      <code className="report-location-id">{location.id}</code>
                    </td>
                    <td>{location.type}</td>
                    <td>{location.condition}</td>
                    <td>
                      <span className={`risk-badge risk-${risk.category.key}`}>
                        {risk.category.label}
                      </span>
                      <span className="risk-score">{risk.score}/100</span>
                    </td>
                    <td className="report-coordinates">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="report-empty">No registered location details to report.</p>
        )}
      </section>
    </div>
  );
}

export default Reports;
