import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ScanSearch,
} from "lucide-react";

import api from "../services/api";

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Defect {
  id?: string;
  inspectionId: string;
  defectType: string;
  confidence: number;
  boundingBox: BoundingBox;
  severity?: string;
  detectedAt?: string;
}

interface AnalysisResponse {
  inspectionId: string;
  analysisStatus: string;
  defects: Defect[];
  severity: {
    score: number;
    level: string;
    explanation?: string;
  };
  risk: {
    score: number;
    category: string;
    breakdown: {
      severityContribution: number;
      recurrenceContribution: number;
      deteriorationContribution: number;
    };
    explanation?: string;
  };
  modelVersion: string;
  analyzedAt: string;
}

interface Inspection {
  id: string;
  inspectionId: string;
  assetId: string;
  imageUrl: string;
  inspectionDate: string;
  status: string;
}

function formatDefectType(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function confidencePercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatLevel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function Detection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInspection() {
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
        setError("Unable to load this inspection.");
      } finally {
        setLoading(false);
      }
    }

    loadInspection();
  }, [id]);

  async function runAnalysis() {
    if (!id) return;

    try {
      setAnalyzing(true);
      setError("");
      setAnalysis(null);

      const response = await api.post<AnalysisResponse>(
        `/api/inspections/${id}/analyze`,
      );

      setAnalysis(response.data);
    } catch (err) {
      console.error(err);
      setError(
        "YOLO analysis failed. Check that the backend and model are running.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading inspection...
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
              {error || "Inspection not found."}
            </p>
          </div>

          <Link
            to="/dashboard"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline"
          >
            <ArrowLeft size={15} />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] px-6 py-8 text-[#17293D] lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#376CF3]"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#376CF3]">
              Inspection analysis
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              {inspection.inspectionId}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Run the real YOLO defect detector against this uploaded
              inspection image.
            </p>
          </div>

          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#376CF3] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2E5BD0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Running YOLO...
              </>
            ) : (
              <>
                <ScanSearch size={17} />
                Run defect analysis
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold">Inspection image</h2>
              <p className="mt-1 text-xs text-slate-500">
                Asset ID: {inspection.assetId}
              </p>
            </div>

            <div className="flex min-h-[480px] items-center justify-center bg-slate-950 p-5">
              <img
                src={inspection.imageUrl}
                alt={`Inspection ${inspection.inspectionId}`}
                className="max-h-[620px] max-w-full rounded-lg object-contain"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold">
                Detection results
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Results returned directly from the backend YOLO analysis.
              </p>
            </div>

            {!analysis && !analyzing && (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <ScanSearch
                  size={32}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="font-semibold text-slate-600">
                  Analysis has not been run
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Run defect analysis to obtain real YOLO detections.
                </p>
              </div>
            )}

            {analyzing && (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <Loader2
                  size={32}
                  className="mx-auto mb-3 animate-spin text-[#376CF3]"
                />

                <p className="font-semibold text-slate-700">
                  YOLO is analyzing the image
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Detecting infrastructure defects...
                </p>
              </div>
            )}

            {analysis && (
              <>
                <div className="mb-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-[#EEF4FF] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Defects
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#376CF3]">
                      {analysis.defects.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Severity
                    </p>

                    <p className="mt-2 text-sm font-bold text-orange-700">
                      {formatLevel(analysis.severity.level)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Risk
                    </p>

                    <p className="mt-2 text-sm font-bold text-red-700">
                      {analysis.risk.score}/100
                    </p>
                  </div>
                </div>

                {analysis.defects.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                    <CheckCircle2
                      size={32}
                      className="mx-auto mb-3 text-emerald-600"
                    />

                    <p className="font-bold text-emerald-800">
                      No defects detected
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      YOLO returned zero detections for this image.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analysis.defects.map((defect, index) => (
                      <div
                        key={defect.id ?? `${defect.defectType}-${index}`}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-[#17293D]">
                              {index + 1}.{" "}
                              {formatDefectType(defect.defectType)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {defect.severity
                                ? `Severity: ${formatLevel(defect.severity)}`
                                : "Detection confidence"}
                            </p>
                          </div>

                          <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                            {confidencePercent(defect.confidence)}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <div>
                            X1:{" "}
                            <span className="font-semibold text-slate-700">
                              {defect.boundingBox.x1}
                            </span>
                          </div>

                          <div>
                            Y1:{" "}
                            <span className="font-semibold text-slate-700">
                              {defect.boundingBox.y1}
                            </span>
                          </div>

                          <div>
                            X2:{" "}
                            <span className="font-semibold text-slate-700">
                              {defect.boundingBox.x2}
                            </span>
                          </div>

                          <div>
                            Y2:{" "}
                            <span className="font-semibold text-slate-700">
                              {defect.boundingBox.y2}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Risk assessment
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {analysis.risk.explanation}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Model: {analysis.modelVersion}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/inspection/analysis/${inspection.id}`)
                  }
                  className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#17293D] transition hover:bg-slate-50"
                >
                  Continue to analysis
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
