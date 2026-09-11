import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface Asset {
  id: string;
  assetId: string;
  name: string;
}

interface Inspection {
  id: string;
  inspectionId: string;
  assetId: string;
  inspectionDate: string;
  status: string;
  analysisStatus?: string;
  severity?: {
    score: number;
    level: string;
  };
  risk?: {
    score: number;
    category: string;
  };
}

interface InspectionRow extends Inspection {
  assetName: string;
}

export default function Inspections() {
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInspections() {
      try {
        const assetsResponse = await api.get("/api/assets");
        const assets: Asset[] = assetsResponse.data;

        const results = await Promise.all(
          assets.map(async (asset) => {
            const response = await api.get(
              `/api/assets/${asset.assetId}/inspections`
            );

            return response.data.map((inspection: Inspection) => ({
              ...inspection,
              assetName: asset.name,
            }));
          })
        );

        setInspections(results.flat());
      } finally {
        setLoading(false);
      }
    }

    loadInspections();
  }, []);

  if (loading) {
    return (
      <p style={{ color: "var(--color-ink-muted)" }}>
        Loading inspections…
      </p>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 6 }}>
            Inspections
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-ink-muted)",
            }}
          >
            Inspection history across all infrastructure assets.
          </p>
        </div>

        <Link
          to="/inspection/new"
          style={{
            padding: "9px 14px",
            borderRadius: 4,
            background: "var(--color-accent)",
            color: "white",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          New Inspection
        </Link>
      </div>

      {inspections.length === 0 ? (
        <p style={{ color: "var(--color-ink-muted)" }}>
          No inspections found.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--color-border)",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "8px 0" }}>Inspection</th>
              <th style={{ padding: "8px 0" }}>Asset</th>
              <th style={{ padding: "8px 0" }}>Date</th>
              <th style={{ padding: "8px 0" }}>Status</th>
              <th style={{ padding: "8px 0" }}>Risk</th>
              <th style={{ padding: "8px 0" }}>Severity</th>
            </tr>
          </thead>

          <tbody>
            {inspections.map((inspection) => (
              <tr
                key={inspection.id}
                style={{
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <td style={{ padding: "10px 0" }}>
                  <Link
                    to={`/inspection/analysis/${inspection.id}`}
                    style={{
                      color: "var(--color-accent)",
                      textDecoration: "none",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {inspection.inspectionId || inspection.id}
                  </Link>
                </td>

                <td style={{ padding: "10px 0" }}>
                  {inspection.assetName}
                </td>

                <td style={{ padding: "10px 0" }}>
                  {new Date(
                    inspection.inspectionDate
                  ).toLocaleDateString()}
                </td>

                <td style={{ padding: "10px 0" }}>
                  {inspection.analysisStatus ||
                    inspection.status ||
                    "—"}
                </td>

                <td
                  style={{
                    padding: "10px 0",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {inspection.risk
                    ? `${inspection.risk.category} (${inspection.risk.score})`
                    : "—"}
                </td>

                <td style={{ padding: "10px 0" }}>
                  {inspection.severity?.level || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}