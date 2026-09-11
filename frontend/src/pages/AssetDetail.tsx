import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

function getRiskStyle(category?: string, score?: number) {
  const normalized = category?.toLowerCase() ?? "";

  if (
    normalized.includes("critical") ||
    normalized.includes("high") ||
    (score != null && score >= 60)
  ) {
    return {
      background: "#FDE8E4",
      color: "#B63C2E",
      border: "#F2C8C1",
    };
  }

  if (
    normalized.includes("medium") ||
    normalized.includes("moderate") ||
    (score != null && score >= 30)
  ) {
    return {
      background: "#FFF3D6",
      color: "#9A6A00",
      border: "#F1D89A",
    };
  }

  return {
    background: "#E9F2EB",
    color: "#587760",
    border: "#C9DDCE",
  };
}

function RiskTrendChart({
  points,
}: {
  points: DeteriorationPoint[];
}) {
  if (points.length < 2) {
    return (
      <div
        style={{
          minHeight: 190,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          borderRadius: 14,
          background: "#FAF9F6",
          border: "1px dashed #DDD9D0",
        }}
      >
        <div>
          <Activity
            size={28}
            style={{
              margin: "0 auto 10px",
              color: "#C3C9CE",
            }}
          />

          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: "#687B8D",
            }}
          >
            Not enough data for a trend yet
          </p>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: "#8A97A2",
            }}
          >
            More inspection history will populate this chart.
          </p>
        </div>
      </div>
    );
  }

  const width = 700;
  const height = 220;
  const paddingX = 28;
  const paddingY = 24;

  const stepX =
    (width - paddingX * 2) / Math.max(points.length - 1, 1);

  const coords = points.map((point, index) => ({
    x: paddingX + index * stepX,
    y:
      height -
      paddingY -
      (Math.min(100, Math.max(0, point.riskScore)) / 100) *
        (height - paddingY * 2),
  }));

  const path = coords
    .map(
      (coord, index) =>
        `${index === 0 ? "M" : "L"} ${coord.x} ${coord.y}`,
    )
    .join(" ");

  return (
    <div>
      <div
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <svg
          width="100%"
          height={220}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{
            minWidth: 520,
            display: "block",
          }}
        >
          {[0, 25, 50, 75, 100].map((value) => {
            const y =
              height -
              paddingY -
              (value / 100) *
                (height - paddingY * 2);

            return (
              <g key={value}>
                <line
                  x1={paddingX}
                  x2={width - paddingX}
                  y1={y}
                  y2={y}
                  stroke="#E9E5DD"
                  strokeWidth="1"
                />

                <text
                  x="0"
                  y={y + 4}
                  fontSize="10"
                  fill="#9AA4AC"
                >
                  {value}
                </text>
              </g>
            );
          })}

          <path
            d={path}
            fill="none"
            stroke="#F0A91D"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coords.map((coord, index) => (
            <g key={`${points[index].date}-${index}`}>
              <circle
                cx={coord.x}
                cy={coord.y}
                r={5}
                fill="#FFFFFF"
                stroke="#F0A91D"
                strokeWidth="3"
              />
            </g>
          ))}
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          fontSize: 11,
          color: "#7C8995",
          fontFamily: "monospace",
          marginTop: 4,
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
      api
        .get(`/api/assets/${id}/deterioration`)
        .catch(() => ({
          data: {
            timeline: [],
          },
        })),
    ])
      .then(
        ([
          assetResponse,
          inspectionsResponse,
          deteriorationResponse,
        ]) => {
          setAsset(assetResponse.data);
          setInspections(inspectionsResponse.data);

          setTimeline(
            (deteriorationResponse.data.timeline ?? []).map(
              (point: any) => ({
                date: point.date,
                riskScore: Number(point.riskScore ?? 0),
              }),
            ),
          );
        },
      )
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F3EE",
          padding: "42px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            color: "#70808F",
            fontSize: 14,
          }}
        >
          Loading asset...
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F3EE",
          padding: "42px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <Link
            to="/assets"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#52687B",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={17} />
            Back to assets
          </Link>

          <p
            style={{
              marginTop: 28,
              color: "#718294",
            }}
          >
            Asset not found.
          </p>
        </div>
      </div>
    );
  }

  const riskStyle = getRiskStyle(
    asset.currentRisk?.category,
    asset.currentRisk?.score,
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F3EE",
        color: "#142B41",
        padding: "30px 42px 60px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Top navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <Link
            to="/assets"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#52687B",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={17} />
            Back to assets
          </Link>

          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#B17A00",
            }}
          >
            ASSET PROFILE
          </span>
        </div>

        {/* Hero */}
        <section
          style={{
            background: "#142B41",
            color: "#FFFFFF",
            borderRadius: 20,
            padding: "30px 32px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 25,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  color: "#F6D98A",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  marginBottom: 12,
                }}
              >
                <Tag size={15} />
                INFRASTRUCTURE ASSET
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 36,
                  lineHeight: 1.1,
                  fontWeight: 550,
                  letterSpacing: "-0.03em",
                }}
              >
                {asset.name}
              </h1>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#B9C7D4",
                  fontSize: 14,
                  fontFamily: "monospace",
                }}
              >
                {asset.assetId}
              </p>
            </div>

            {asset.currentRisk && (
              <div
                style={{
                  minWidth: 155,
                  padding: "15px 17px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#9FB0BF",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    marginBottom: 6,
                  }}
                >
                  CURRENT RISK
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                  }}
                >
                  <strong
                    style={{
                      fontSize: 30,
                    }}
                  >
                    {asset.currentRisk.score}
                  </strong>

                  <span
                    style={{
                      fontSize: 12,
                      color: "#B9C7D4",
                    }}
                  >
                    /100
                  </span>
                </div>

                <span
                  style={{
                    display: "inline-block",
                    marginTop: 7,
                    padding: "5px 9px",
                    borderRadius: 999,
                    background: riskStyle.background,
                    color: riskStyle.color,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {asset.currentRisk.category}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Information cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <InfoCard
            icon={<Tag size={19} />}
            label="Asset type"
            value={asset.type}
          />

          <InfoCard
            icon={<MapPin size={19} />}
            label="Location"
            value={asset.location || "Not provided"}
          />

          <InfoCard
            icon={<ClipboardCheck size={19} />}
            label="Inspections"
            value={String(inspections.length)}
          />
        </div>

        {/* Main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.45fr) minmax(300px, 0.75fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Left */}
          <div
            style={{
              display: "grid",
              gap: 20,
            }}
          >
            {/* Risk trend */}
            <section
              style={{
                background: "#FFFFFF",
                border: "1px solid #DDD9D0",
                borderRadius: 18,
                padding: 26,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 20,
                  marginBottom: 22,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: "#B17A00",
                      marginBottom: 7,
                    }}
                  >
                    CONDITION TREND
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: 21,
                    }}
                  >
                    Risk over time
                  </h2>
                </div>

                <Activity
                  size={20}
                  style={{
                    color: "#F0A91D",
                  }}
                />
              </div>

              <RiskTrendChart points={timeline} />
            </section>

            {/* Inspection history */}
            <section
              style={{
                background: "#FFFFFF",
                border: "1px solid #DDD9D0",
                borderRadius: 18,
                padding: 26,
              }}
            >
              <div
                style={{
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: "#B17A00",
                    marginBottom: 7,
                  }}
                >
                  INSPECTION HISTORY
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 21,
                  }}
                >
                  Recent inspections
                </h2>
              </div>

              {inspections.length === 0 ? (
                <div
                  style={{
                    padding: 25,
                    textAlign: "center",
                    background: "#FAF9F6",
                    borderRadius: 13,
                    color: "#778795",
                    fontSize: 13,
                  }}
                >
                  No inspections found.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: 11,
                  }}
                >
                  {inspections.map((inspection) => {
                    const inspectionRisk = getRiskStyle(
                      inspection.risk?.category,
                      inspection.risk?.score,
                    );

                    return (
                      <div
                        key={inspection.id}
                        style={{
                          border: "1px solid #E4E0D8",
                          borderRadius: 14,
                          padding: 17,
                          background: "#FCFBF8",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 15,
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                            }}
                          >
                            <CalendarDays
                              size={16}
                              color="#B17A00"
                            />

                            <strong
                              style={{
                                fontSize: 13,
                                fontFamily: "monospace",
                              }}
                            >
                              {inspection.inspectionDate ??
                                inspection.date ??
                                "Inspection"}
                            </strong>
                          </div>

                          <span
                            style={{
                              padding: "5px 9px",
                              borderRadius: 999,
                              background: "#EEF1F3",
                              color: "#617283",
                              fontSize: 10,
                              fontWeight: 800,
                            }}
                          >
                            {inspection.analysisStatus ??
                              "Unknown"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            marginTop: 14,
                          }}
                        >
                          {inspection.risk && (
                            <span
                              style={{
                                padding: "6px 9px",
                                borderRadius: 999,
                                background:
                                  inspectionRisk.background,
                                color:
                                  inspectionRisk.color,
                                fontSize: 10,
                                fontWeight: 800,
                              }}
                            >
                              Risk {inspection.risk.score}/100 ·{" "}
                              {inspection.risk.category}
                            </span>
                          )}

                          {inspection.severity && (
                            <span
                              style={{
                                padding: "6px 9px",
                                borderRadius: 999,
                                background: "#FFF3D6",
                                color: "#9A6A00",
                                fontSize: 10,
                                fontWeight: 800,
                              }}
                            >
                              Severity{" "}
                              {inspection.severity.score}/100 ·{" "}
                              {inspection.severity.level}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/inspection/analysis/${inspection.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            marginTop: 14,
                            color: "#B17A00",
                            textDecoration: "none",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          View analysis
                          <ArrowLeft
                            size={14}
                            style={{
                              transform: "rotate(180deg)",
                            }}
                          />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right */}
          <div
            style={{
              display: "grid",
              gap: 20,
            }}
          >
            {/* Current condition */}
            <section
              style={{
                background: "#142B41",
                color: "#FFFFFF",
                borderRadius: 18,
                padding: 25,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  color: "#F6D98A",
                  marginBottom: 17,
                }}
              >
                <ShieldAlert size={16} />
                CURRENT CONDITION
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 750,
                }}
              >
                {asset.currentRisk?.category ??
                  "Unassessed"}
              </div>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#B9C7D4",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                {asset.currentRisk
                  ? `Current risk score is ${asset.currentRisk.score} out of 100.`
                  : "No current risk score has been assigned to this asset."}
              </p>
            </section>

            {/* Asset metadata */}
            <section
              style={{
                background: "#FFFFFF",
                border: "1px solid #DDD9D0",
                borderRadius: 18,
                padding: 25,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  color: "#B17A00",
                  marginBottom: 17,
                }}
              >
                ASSET INFORMATION
              </div>

              <MetadataRow
                label="Asset ID"
                value={asset.assetId}
              />

              <MetadataRow
                label="Type"
                value={asset.type}
              />

              <MetadataRow
                label="Location"
                value={asset.location || "Not provided"}
              />

              {asset.createdAt && (
                <MetadataRow
                  label="Created"
                  value={asset.createdAt}
                />
              )}
            </section>

            {/* Quick action */}
            <Link
              to={`/inspection/new`}
              style={{
                textDecoration: "none",
                background: "#F6AE24",
                color: "#142B41",
                borderRadius: 15,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 15,
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <ClipboardCheck size={18} />
                Start new inspection
              </span>

              <ArrowLeft
                size={17}
                style={{
                  transform: "rotate(180deg)",
                }}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #DDD9D0",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          display: "grid",
          placeItems: "center",
          background: "#FFF3D6",
          color: "#B17A00",
          marginBottom: 14,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "#7A8997",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 16,
          fontWeight: 750,
          color: "#142B41",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 15,
        padding: "11px 0",
        borderBottom: "1px solid #ECE8E0",
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "#7A8997",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          fontSize: 11,
          color: "#142B41",
          textAlign: "right",
          fontFamily:
            label === "Asset ID"
              ? "monospace"
              : "inherit",
        }}
      >
        {value}
      </strong>
    </div>
  );
}