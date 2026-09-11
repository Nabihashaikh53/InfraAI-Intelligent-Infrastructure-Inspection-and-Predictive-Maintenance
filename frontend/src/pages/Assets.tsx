import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface Asset {
  id: string;
  assetId: string;
  name: string;
  type: string;
  status: string;
  currentCondition: string | null;
}

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/assets").then((res) => {
      setAssets(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <p
        style={{
          color: "var(--color-ink-muted)",
        }}
      >
        Loading assets…
      </p>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontSize: 22,
          marginBottom: 24,
        }}
      >
        Assets
      </h1>

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
            <th
              style={{
                padding: "8px 0",
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
              }}
            >
              Asset ID
            </th>

            <th
              style={{
                padding: "8px 0",
              }}
            >
              Name
            </th>

            <th
              style={{
                padding: "8px 0",
              }}
            >
              Type
            </th>

            <th
              style={{
                padding: "8px 0",
              }}
            >
              Status
            </th>

            <th
              style={{
                padding: "8px 0",
              }}
            >
              Condition
            </th>
          </tr>
        </thead>

        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <td
                style={{
                  padding: "10px 0",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <Link
                  to={`/assets/${asset.id}`}
                  style={{
                    color: "var(--color-accent)",
                    textDecoration: "none",
                  }}
                >
                  {asset.assetId}
                </Link>
              </td>

              <td
                style={{
                  padding: "10px 0",
                }}
              >
                {asset.name}
              </td>

              <td
                style={{
                  padding: "10px 0",
                }}
              >
                {asset.type}
              </td>

              <td
                style={{
                  padding: "10px 0",
                }}
              >
                {asset.status}
              </td>

              <td
                style={{
                  padding: "10px 0",
                }}
              >
                {asset.currentCondition ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
