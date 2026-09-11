import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileCheck2,
  MapPin,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../services/api";

interface Asset {
  id: string;
  assetId: string;
  name: string;
  type: string;
  description?: string | null;
  location?: string | null;
  status: string;
  currentRisk?: number | null;
  currentCondition?: string | null;
}

interface Inspection {
  id: string;
  inspectionId: string;
  assetId: string;
  userId: string;
  imageUrl: string;
  inspectionDate: string;
  status: string;
}

interface Defect {
  id: string;
  inspectionId: string;
  defectType: string;
  confidence: number;
  boundingBox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  detectedAt: string;
}

interface InspectionWithAsset extends Inspection {
  assetName: string;
  assetLocation?: string | null;
}

function riskBand(score: number | null | undefined) {
  if (score == null) return "Unassessed";
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

function riskClass(score: number | null | undefined) {
  const band = riskBand(score);

  switch (band) {
    case "Critical":
      return "bg-[#FDE8E4] text-[#B63C2E] border-[#F2C8C1]";

    case "High":
      return "bg-[#FDE8E4] text-[#B63C2E] border-[#F2C8C1]";

    case "Medium":
      return "bg-[#FFF3D6] text-[#9A6A00] border-[#F1D89A]";

    case "Low":
      return "bg-[#E9F2EB] text-[#587760] border-[#C9DDCE]";

    default:
      return "bg-[#F1F0EC] text-[#667788] border-[#DDD9D0]";
  }
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDefectType(value: string) {
  return value
    .replace(/[\_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#DDD9D0] bg-white p-5 shadow-[0_4px_18px_rgba(20,43,65,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7A8997]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#142B41]">
            {value}
          </p>

          <p className="mt-1 text-xs text-[#7B8996]">{description}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3D6] text-[#B17A00]">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [inspections, setInspections] = useState<InspectionWithAsset[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      /*
       * Load all assets from the real backend.
       */
      const assetsResponse = await api.get<Asset[]>("/api/assets");

      const loadedAssets = assetsResponse.data;

      setAssets(loadedAssets);

      /*
       * Load inspections for every asset.
       */
      const inspectionResults = await Promise.all(
        loadedAssets.map(async (asset) => {
          try {
            const response = await api.get<Inspection[]>(
              `/api/assets/${asset.assetId}/inspections`,
            );

            return response.data.map((inspection) => ({
              ...inspection,
              assetName: asset.name,
              assetLocation: asset.location,
            }));
          } catch {
            return [];
          }
        }),
      );

      const loadedInspections = inspectionResults.flat();

      setInspections(loadedInspections);

      /*
       * Load defects for every inspection.
       */
      const defectResults = await Promise.all(
        loadedInspections.map(async (inspection) => {
          try {
            const response = await api.get<Defect[]>(
              `/api/inspections/${inspection.id}/defects`,
            );

            return response.data;
          } catch {
            return [];
          }
        }),
      );

      setDefects(defectResults.flat());
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data from the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * Assets with risk >= 60 are considered high risk.
   */
  const highRiskAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.currentRisk != null &&
          asset.currentRisk >= 60,
      ),
    [assets],
  );

  /*
   * Build risk chart using real asset risk values.
   */
  const riskChartData = useMemo(
    () =>
      assets
        .filter((asset) => asset.currentRisk != null)
        .sort(
          (a, b) =>
            (b.currentRisk ?? 0) -
            (a.currentRisk ?? 0),
        )
        .slice(0, 8)
        .map((asset) => ({
          name:
            asset.name.length > 18
              ? `${asset.name.slice(0, 18)}…`
              : asset.name,
          risk: Number(asset.currentRisk),
        })),
    [assets],
  );

  /*
   * Build defect distribution from real persisted detections.
   */
  const defectChartData = useMemo(() => {
    const counts = new Map<string, number>();

    for (const defect of defects) {
      counts.set(
        defect.defectType,
        (counts.get(defect.defectType) ?? 0) + 1,
      );
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name: formatDefectType(name),
        value,
      }));
  }, [defects]);

  /*
   * Most recent inspections.
   */
  const recentInspections = useMemo(
    () =>
      [...inspections]
        .sort(
          (a, b) =>
            new Date(b.inspectionDate).getTime() -
            new Date(a.inspectionDate).getTime(),
        )
        .slice(0, 6),
    [inspections],
  );

  /*
   * Count inspections marked as analyzed/completed.
   */
  const analyzedInspections = useMemo(
    () =>
      inspections.filter(
        (inspection) =>
          inspection.status === "analyzed" ||
          inspection.status === "completed",
      ).length,
    [inspections],
  );

  const assetsWithRisk = assets.filter(
    (asset) => asset.currentRisk != null,
  ).length;

  return (
    <div className="min-h-screen bg-[#F5F3EE] px-6 py-8 text-[#142B41] lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#B17A00]">
              INFRAAI · INFRASTRUCTURE INTELLIGENCE
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#142B41]">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#66788A]">
              Monitor asset condition, inspection activity, detected defects, and
              infrastructure risk from your live backend.
            </p>
          </div>

          {/* ACTION BUTTONS */}

          <div className="flex flex-wrap items-center gap-3">

            {/* NEW INSPECTION BUTTON */}

            <Link
              to="/inspection/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#142B41] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203B55]"
            >
              <FileCheck2 size={17} />
              New Inspection
            </Link>

            {/* REFRESH BUTTON */}

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDD9D0] bg-white px-4 py-2.5 text-sm font-semibold text-[#142B41] shadow-sm transition hover:bg-[#F1F0EC] disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={18} />

            {error}
          </div>
        )}

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={Building2}
            label="Monitored assets"
            value={loading ? "—" : String(assets.length)}
            description="Active assets in the backend"
          />

          <StatCard
            icon={FileCheck2}
            label="Inspections"
            value={loading ? "—" : String(inspections.length)}
            description="Stored inspection records"
          />

          <StatCard
            icon={ShieldAlert}
            label="Detected defects"
            value={loading ? "—" : String(defects.length)}
            description="Persisted YOLO detections"
          />

          <StatCard
            icon={Activity}
            label="High-risk assets"
            value={loading ? "—" : String(highRiskAssets.length)}
            description="Assets with risk ≥ 60"
          />
        </div>

        {/* =====================================================
            NEW INSPECTION ACTION CARD
        ====================================================== */}

        <div className="mt-6 rounded-2xl border border-[#E4D39F] bg-[#FFF8E8] p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#B17A00] shadow-sm">
                  <FileCheck2 size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#142B41]">
                    Start a new inspection
                  </h2>

                  <p className="mt-1 text-sm text-[#66788A]">
                    Upload an infrastructure image and run the real YOLO
                    defect analysis.
                  </p>
                </div>
              </div>

              {/* PROCESS STEPS */}

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#66788A]">

                <span className="rounded-full bg-white px-3 py-1.5">
                  1. Select asset
                </span>

                <span className="rounded-full bg-white px-3 py-1.5">
                  2. Upload image
                </span>

                <span className="rounded-full bg-white px-3 py-1.5">
                  3. Detect defects
                </span>

                <span className="rounded-full bg-white px-3 py-1.5">
                  4. Analyze risk
                </span>

              </div>
            </div>

            {/* UPLOAD BUTTON */}

            <Link
              to="/inspection/new"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#142B41] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#203B55]"
            >
              Upload Inspection Image
            </Link>

          </div>
        </div>

        {/* =====================================================
            CHARTS
        ====================================================== */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* CURRENT ASSET RISK */}

          <section className="rounded-2xl border border-[#DDD9D0] bg-white p-6 shadow-[0_4px_18px_rgba(20,43,65,0.04)]">

            <div className="mb-5 flex items-start justify-between">

              <div>
                <h2 className="text-lg font-bold text-[#142B41]">
                  Current asset risk
                </h2>

                <p className="mt-1 text-sm text-[#7B8996]">
                  Real risk scores currently stored on assets.
                </p>
              </div>

              <span className="rounded-lg bg-[#F1F0EC] px-3 py-1.5 text-xs font-semibold text-[#667788]">
                {assetsWithRisk} assessed
              </span>

            </div>

            <div className="h-[300px]">

              {riskChartData.length > 0 ? (

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart
                    data={riskChartData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 20,
                      left: 20,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="risk"
                      radius={[0, 6, 6, 0]}
                      fill="#F0A91D"
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full items-center justify-center rounded-xl bg-[#F7F6F2] text-center">

                  <div>

                    <Activity
                      size={28}
                      className="mx-auto mb-3 text-[#C5C0B5]"
                    />

                    <p className="font-semibold text-[#66788A]">
                      No risk scores yet
                    </p>

                    <p className="mt-1 text-sm text-[#9AA4AD]">
                      Risk data will appear here once assets are scored.
                    </p>

                  </div>

                </div>
              )}

            </div>
          </section>

          {/* DEFECT DISTRIBUTION */}

          <section className="rounded-2xl border border-[#DDD9D0] bg-white p-6 shadow-[0_4px_18px_rgba(20,43,65,0.04)]">

            <div className="mb-5">

              <h2 className="text-lg font-bold text-[#142B41]">
                Defect distribution
              </h2>

              <p className="mt-1 text-sm text-[#7B8996]">
                Actual persisted detections grouped by defect type.
              </p>

            </div>

            <div className="h-[300px]">

              {defectChartData.length > 0 ? (

                <ResponsiveContainer width="100%" height="100%">

                  <PieChart>

                    <Pie
                      data={defectChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                    >

                      {defectChartData.map((_, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#F0A91D",
                              "#D95C47",
                              "#6D9277",
                              "#6D8194",
                              "#A58A52",
                            ][index % 5]
                          }
                        />

                      ))}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full items-center justify-center rounded-xl bg-[#F7F6F2] text-center">

                  <div>

                    <CheckCircle2
                      size={28}
                      className="mx-auto mb-3 text-[#6D9277]"
                    />

                    <p className="font-semibold text-[#66788A]">
                      No defects detected yet
                    </p>

                    <p className="mt-1 text-sm text-[#9AA4AD]">
                      Analyze an inspection to populate this chart.
                    </p>

                  </div>

                </div>
              )}

            </div>
          </section>

        </div>

        {/* =====================================================
            RISK OVERVIEW + RECENT INSPECTIONS
        ====================================================== */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.5fr]">

          {/* RISK OVERVIEW */}

          <section className="rounded-2xl border border-[#DDD9D0] bg-white p-6 shadow-[0_4px_18px_rgba(20,43,65,0.04)]">

            <h2 className="text-lg font-bold text-[#142B41]">
              Risk overview
            </h2>

            <p className="mt-1 text-sm text-[#7B8996]">
              Current asset condition from the backend.
            </p>

            <div className="mt-5 space-y-3">

              {assets.length === 0 && !loading && (

                <p className="rounded-xl bg-[#F7F6F2] p-4 text-sm text-[#7B8996]">
                  No assets registered yet.
                </p>

              )}

              {assets
                .slice()
                .sort(
                  (a, b) =>
                    (b.currentRisk ?? -1) -
                    (a.currentRisk ?? -1),
                )
                .slice(0, 6)
                .map((asset) => (

                  <div
                    key={asset.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E8E5DE] p-3"
                  >

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-[#142B41]">
                        {asset.name}
                      </p>

                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#7B8996]">
                        <MapPin size={12} />

                        {asset.location || "Location not provided"}
                      </p>

                    </div>

                    <div
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold ${riskClass(
                        asset.currentRisk,
                      )}`}
                    >

                      {asset.currentRisk != null
                        ? `${asset.currentRisk.toFixed(0)} · ${riskBand(
                            asset.currentRisk,
                          )}`
                        : "Unassessed"}

                    </div>

                  </div>

                ))}

            </div>
          </section>

          {/* RECENT INSPECTIONS */}

          <section className="rounded-2xl border border-[#DDD9D0] bg-white p-6 shadow-[0_4px_18px_rgba(20,43,65,0.04)]">

            <div className="mb-5 flex items-start justify-between">

              <div>

                <h2 className="text-lg font-bold text-[#142B41]">
                  Recent inspections
                </h2>

                <p className="mt-1 text-sm text-[#7B8996]">
                  Latest inspection records returned by the backend.
                </p>

              </div>

              <Link
                to="/assets"
                className="text-sm font-semibold text-[#B17A00] hover:underline"
              >
                View assets
              </Link>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[600px]">

                <thead>

                  <tr className="border-b border-[#E8E5DE] text-left">

                    <th className="pb-3 text-xs font-bold uppercase tracking-wider text-[#8A959F]">
                      Inspection
                    </th>

                    <th className="pb-3 text-xs font-bold uppercase tracking-wider text-[#8A959F]">
                      Asset
                    </th>

                    <th className="pb-3 text-xs font-bold uppercase tracking-wider text-[#8A959F]">
                      Date
                    </th>

                    <th className="pb-3 text-xs font-bold uppercase tracking-wider text-[#8A959F]">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentInspections.map((inspection) => (

                    <tr
                      key={inspection.id}
                      className="border-b border-[#F1EFEA] last:border-0"
                    >

                      <td className="py-4 text-sm font-semibold text-[#142B41]">
                        {inspection.inspectionId}
                      </td>

                      <td className="py-4 text-sm text-[#66788A]">
                        {inspection.assetName}
                      </td>

                      <td className="py-4 text-sm text-[#7B8996]">
                        {formatDate(inspection.inspectionDate)}
                      </td>

                      <td className="py-4">

                        <span className="rounded-full bg-[#F1F0EC] px-2.5 py-1 text-xs font-semibold text-[#66788A]">
                          {inspection.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                  {recentInspections.length === 0 && !loading && (

                    <tr>

                      <td
                        colSpan={4}
                        className="py-10 text-center text-sm text-[#9AA4AD]"
                      >
                        No inspections have been uploaded yet.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#F7F6F2] px-4 py-3 text-xs text-[#7B8996]">

              <CheckCircle2
                size={14}
                className="text-[#6D9277]"
              />

              {analyzedInspections} inspection
              {analyzedInspections === 1 ? "" : "s"} currently marked as
              analyzed or completed.

            </div>

          </section>

        </div>

      </div>
    </div>
  );
}