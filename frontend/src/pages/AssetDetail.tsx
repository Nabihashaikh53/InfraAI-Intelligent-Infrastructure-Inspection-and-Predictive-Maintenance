import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

interface Asset {
  assetId: string;
  name: string;
  type: string;
  location?: string;
  createdAt?: string;
  currentRisk?: {
    score: number;
    category: string;
  };
}

interface Inspection {
  id: string;
  inspectionDate?: string;
  date?: string;
  imageQuality?: {
    score: number;
    status: string;
  };
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

interface DeteriorationPoint {
  date: string;
  riskScore: number;
}

function RiskTrendChart({
  points,
}: {
  points: DeteriorationPoint[];
}) {
  if (points.length < 2) {
    return (
      <p
        style={{
          fontSize: 13,
          color: "var(--color-ink-muted)",
          marginBottom: 24,
        }}
      >
        Not enough data for a trend chart yet.
      </p>
    );
  }

  const width = 400;
  const height = 120;
  const padding = 10;

  const stepX =
    (width - padding * 2) / (points.length - 1);

  const coords = points.map((point, index) => ({
    x: padding + index * stepX,
    y:
      height -
      padding -
      (Math.min(100, Math.max(0, point.riskScore)) / 100) *
        (height - padding * 2),
  }));

  const path = coords
    .map(
      (coord, index) =>
        `${index === 0 ? "M" : "L"} ${coord.x} ${coord.y}`
    )
    .join(" ");

  return (
    <div style={{ marginBottom: 24 }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          maxWidth: "100%",
          display: "block",
        }}
      >
        <path
          d={path}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
        />

        {coords.map((coord, index) => (
          <circle
            key={`${points[index].date}-${index}`}
            cx={coord.x}
            cy={coord.y}
            r={3}
            fill="var(--color-accent)"
          />
        ))}
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--color-ink-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>{points[0].date}</span>
        <span>{points[points.length - 1].date}</span>
      </div>
    </div>
  );
}

export default function AssetDetail() {
  const { id } = useParams();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [timeline, setTimeline] = useState<DeteriorationPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get(`/api/assets/${id}`),
      api.get(`/api/assets/${id}/inspections`),
      api.get(`/api/assets/${id}/deterioration`).catch(() => ({
        data: { timeline: [] },
      })),
    ])
      .then(([assetResponse, inspectionsResponse, deteriorationResponse]) => {
        setAsset(assetResponse.data);
        setInspections(inspectionsResponse.data);

        setTimeline(
          (deteriorationResponse.data.timeline ?? []).map(
            (point: any) => ({
              date: point.date,
              riskScore: Number(point.riskScore ?? 0),
            })
          )
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <p style={{ color: "var(--color-ink-muted)" }}>
        Loading asset…
      </p>
    );
  }

  if (!asset) {
    return (
      <p style={{ color: "var(--color-ink-muted)" }}>
        Asset not found.
      </p>
    );
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/dashboard"
          style={{
            color: "var(--color-accent)",
            fontSize: 13,
          }}
        >
          ← Back to dashboard
        </Link>
      </div>

      <h1
        style={{
          fontSize: 24,
          marginBottom: 4,
        }}
      >
        {asset.name}
      </h1>

      <p
        style={{
          fontSize: 13,
          color: "var(--color-ink-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 24,
        }}
      >
        {asset.assetId}
      </p>

      <section
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 16,
            marginBottom: 12,
          }}
        >
          Asset Information
        </h2>

        <div
          style={{
            display: "grid",
            gap: 8,
            fontSize: 14,
          }}
        >
          <div>
            <strong>Type:</strong> {asset.type}
          </div>

          {asset.location && (
            <div>
              <strong>Location:</strong> {asset.location}
            </div>
          )}

          {asset.currentRisk && (
            <div>
              <strong>Current Risk:</strong>{" "}
              {asset.currentRisk.category} (
              {asset.currentRisk.score}/100)
            </div>
          )}
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 16,
            marginBottom: 12,
          }}
        >
          Risk Trend
        </h2>

        <RiskTrendChart points={timeline} />
      </section>

      <section>
        <h2
          style={{
            fontSize: 16,
            marginBottom: 12,
          }}
        >
          Inspection History
        </h2>

        {inspections.length === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: "var(--color-ink-muted)",
            }}
          >
            No inspections found.
          </p>
        ) : (
          inspections.map((inspection) => (
            <div
              key={inspection.id}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <strong
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                  }}
                >
                  {inspection.inspectionDate ??
                    inspection.date ??
                    "Inspection"}
                </strong>

                <span
                  style={{
                    fontSize: 13,
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {inspection.analysisStatus ?? "unknown"}
                </span>
              </div>

              {inspection.risk && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                  }}
                >
                  Risk:{" "}
                  <strong>
                    {inspection.risk.category}
                  </strong>{" "}
                  ({inspection.risk.score}/100)
                </div>
              )}

              {inspection.severity && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 14,
                  }}
                >
                  Severity:{" "}
                  <strong>
                    {inspection.severity.level}
                  </strong>{" "}
                  ({inspection.severity.score}/100)
                </div>
              )}

              <Link
                to={`/inspection/analysis/${inspection.id}`}
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  color: "var(--color-accent)",
                  fontSize: 13,
                }}
              >
                View analysis →
              </Link>
            </div>
          ))
        )}
      </section>
    </div>
  );
}