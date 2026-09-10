import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import api from "../services/api";

interface Inspection {
  id: string;
  inspectionId: string;
  assetId: string;
  imageUrl: string;
  inspectionDate: string;
  status: string;
  imageQuality?: {
    score: number;
    status: string;
    issues: string[];
  } | null;
  analysisStatus?: string | null;
  severity?: {
    score: number;
    level: string;
    explanation?: string;
  } | null;
  risk?: {
    score: number;
    category: string;
    breakdown: {
      severityContribution: number;
      recurrenceContribution: number;
      deteriorationContribution: number;
    };
    explanation?: string;
  } | null;
  modelVersion?: string | null;
  analyzedAt?: string | null;
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function Analysis() {
  const { id } = useParams<{ id: string }>();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Inspection ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<Inspection>(
          `/api/inspections/${id}`,
        );

        setInspection(response.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load the analysis.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading analysis...
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} />
            <p className="font-semibold">
              {error || "Analysis not found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const severity = inspection.severity;
  const risk = inspection.risk;
  const quality = inspection.imageQuality;

  return (
    <div className="min-h-screen bg-[#F5F3EE] px-6 py-8 text-[#17293D] lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <Link
          to={`/inspection/detect/${inspection.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#376CF3]"
        >
          <ArrowLeft size={16} />
          Back to detection
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#376CF3]">
            Final analysis
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            {inspection.inspectionId}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Asset ID: {inspection.assetId}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Image quality
            </p>

            <p className="mt-3 text-4xl font-bold text-[#376CF3]">
              {quality?.score ?? "—"}
              {quality ? "/100" : ""}
            </p>

            <p className="mt-2 text-sm font-semibold">
              {quality ? titleCase(quality.status) : "Not available"}
            </p>

            {quality?.issues && quality.issues.length > 0 && (
              <ul className="mt-4 space-y-1 text-xs text-slate-500">
                {quality.issues.map((issue) => (
                  <li key={issue}>• {issue}</li>
                ))}
              </ul>
            )}

            {quality?.issues?.length === 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={15} />
                No quality issues reported
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Severity
            </p>

            <p className="mt-3 text-4xl font-bold text-orange-600">
              {severity?.score ?? "—"}
              {severity ? "/100" : ""}
            </p>

            <p className="mt-2 text-lg font-bold">
              {severity ? titleCase(severity.level) : "Not available"}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              {severity?.explanation ||
                "Severity assessment is not available."}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall risk
            </p>

            <div className="mt-3 flex items-center gap-3">
              <ShieldAlert size={32} />

              <div>
                <p className="text-4xl font-bold">
                  {risk?.score ?? "—"}
                  {risk ? "/100" : ""}
                </p>

                <p className="text-sm font-bold">
                  {risk ? risk.category : "Not available"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              {risk?.explanation || "Risk assessment is not available."}
            </p>
          </section>
        </div>

        {risk && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Risk breakdown</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Severity contribution
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {risk.breakdown.severityContribution}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recurrence contribution
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {risk.breakdown.recurrenceContribution}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Deterioration contribution
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {risk.breakdown.deteriorationContribution}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Analysis metadata</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Status
              </p>
              <p className="mt-1 font-semibold">
                {inspection.analysisStatus || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Model version
              </p>
              <p className="mt-1 font-semibold">
                {inspection.modelVersion || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Analyzed at
              </p>
              <p className="mt-1 font-semibold">
                {inspection.analyzedAt
                  ? new Date(inspection.analyzedAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#376CF3] px-5 py-3 text-sm font-bold text-white hover:bg-[#2E5BD0]"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}