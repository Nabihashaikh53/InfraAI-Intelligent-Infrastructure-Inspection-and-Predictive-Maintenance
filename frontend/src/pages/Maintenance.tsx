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
      <p style={{ color: "var(--color-ink-muted)" }}>
        Loading maintenance queue…
      </p>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>
        Maintenance Queue
      </h1>

      <p
        style={{
          fontSize: 14,
          color: "var(--color-ink-muted)",
          marginBottom: 24,
        }}
      >
        Assets sorted by priority, based on the most recent analyzed
        inspection.
      </p>

      {queue.length === 0 && (
        <p style={{ color: "var(--color-ink-muted)" }}>
          No analyzed inspections yet.
        </p>
      )}

      {queue.map((item) => (
        <Link
          key={item.assetId}
          to={`/assets/${item.assetId}`}
          style={{
            display: "block",
            padding: 16,
            border: "1px solid var(--color-border)",
            borderLeft: `4px solid ${priorityColor(item.priority)}`,
            borderRadius: 4,
            marginBottom: 10,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ fontFamily: "var(--font-mono)" }}>
                {item.assetId}
              </strong>{" "}
              — {item.assetName}
            </div>

            <span
              style={{
                fontWeight: 600,
                color: priorityColor(item.priority),
                fontFamily: "var(--font-mono)",
              }}
            >
              {item.priority} — {item.priorityLabel}
            </span>
          </div>

          <div
            style={{
              fontSize: 13,
              color: "var(--color-ink-muted)",
              marginTop: 6,
            }}
          >
            {item.reason}
          </div>
        </Link>
      ))}
    </div>
  );
}