import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface PriorityItem {
  assetId: string;
  assetName: string;
  priority: string;
  priorityLabel: string;
  reason: string;
}

const priorityColor = (priority: string) => {
  switch (priority) {
    case "P1":
      return "var(--risk-critical)";
    case "P2":
      return "var(--risk-high)";
    case "P3":
      return "var(--risk-moderate)";
    default:
      return "var(--risk-low)";
  }
};

const riskLabel = (priority: string) => {
  switch (priority) {
    case "P1":
      return "HIGH";
    case "P2":
      return "MEDIUM";
    case "P3":
      return "MEDIUM";
    default:
      return "LOW";
  }
};

export default function Maintenance() {
  const [queue, setQueue] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/maintenance/priorities")
      .then((res) => {
        setQueue(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <p style={{ color: "var(--color-ink-muted)" }}>
          Loading maintenance queue...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, paddingBottom: 40 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.5,
              fontWeight: 700,
              color: "var(--color-accent)",
              marginBottom: 10,
            }}
          >
            ACTION / MAINTENANCE QUEUE
          </div>

          <h1
            style={{
              fontSize: 32,
              lineHeight: 1.15,
              margin: 0,
              marginBottom: 12,
            }}
          >
            Prioritize the work.
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "var(--color-ink-muted)",
              margin: 0,
            }}
          >
            A ranked queue built from risk, confidence, and deterioration
            velocity.
          </p>
        </div>

        <button
          type="button"
          style={{
            border: 0,
            borderRadius: 7,
            background: "#F6AE24",
            color: "#17283D",
            padding: "13px 18px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          +&nbsp; Add work order
        </button>
      </div>

      {/* Queue controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <button
          type="button"
          style={{
            width: 94,
            height: 40,
            border: "1px solid var(--color-border)",
            borderRadius: 7,
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ⚱ All
        </button>

        <span
          style={{
            fontSize: 13,
            color: "var(--color-ink-muted)",
          }}
        >
          {queue.length} work orders · sorted by urgency
        </span>
      </div>

      {/* Empty state */}
      {queue.length === 0 && (
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            background: "var(--color-surface)",
            padding: 32,
            color: "var(--color-ink-muted)",
          }}
        >
          No analyzed inspections yet.
        </div>
      )}

      {/* Work-order table */}
      {queue.length > 0 && (
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            background: "var(--color-surface)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px minmax(260px, 1.6fr) 150px minmax(230px, 1.3fr) 110px 110px",
              alignItems: "center",
              minHeight: 48,
              padding: "0 20px",
              borderBottom: "1px solid var(--color-border)",
              fontSize: 10,
              letterSpacing: 1.2,
              fontWeight: 700,
              color: "var(--color-ink-muted)",
            }}
          >
            <span>#</span>
            <span>ASSET / SIGNAL</span>
            <span>RISK</span>
            <span>RECOMMENDED ACTION</span>
            <span>DUE</span>
            <span />
          </div>

          {queue.map((item, index) => {
            const color = priorityColor(item.priority);
            const risk = riskLabel(item.priority);

            return (
              <div
                key={item.assetId}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "60px minmax(260px, 1.6fr) 150px minmax(230px, 1.3fr) 110px 110px",
                  alignItems: "center",
                  minHeight: 78,
                  padding: "0 20px",
                  borderBottom:
                    index === queue.length - 1
                      ? "none"
                      : "1px solid var(--color-border)",
                }}
              >
                {/* Number */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-ink-muted)",
                    fontSize: 14,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Asset */}
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 5,
                    }}
                  >
                    {item.assetName} · {item.priorityLabel}
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {item.assetId}
                  </div>
                </div>

                {/* Risk */}
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: "#DCEFEB",
                      color: color,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                    }}
                  >
                    {risk}
                  </span>
                </div>

                {/* Recommended action */}
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--color-ink-muted)",
                    lineHeight: 1.5,
                    paddingRight: 20,
                  }}
                >
                  {item.reason}
                </div>

                {/* Due */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--color-ink)",
                  }}
                >
                  —
                </div>

                {/* Action */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 14,
                  }}
                >
                  <Link
                    to={`/assets/${item.assetId}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 66,
                      padding: "10px 13px",
                      borderRadius: 7,
                      background: "#17283D",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Start
                  </Link>

                  <span
                    style={{
                      color: "var(--color-ink-muted)",
                      fontSize: 18,
                      lineHeight: 1,
                    }}
                  >
                    ···
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}