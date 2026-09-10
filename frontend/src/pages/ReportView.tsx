import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

interface Report {
  header: {
    inspectionId: string;
    generatedAt: string;
  };
  asset: {
    assetId: string;
    name: string;
    type: string;
  };
  inspection: {
    date: string;
    imageQuality?: {
      score: number;
      status: string;
    };
  };
  defects: {
    type: string;
    confidence: number;
    severity: string;
  }[];
  overallAssessment: {
    riskScore: number;
    riskLevel: string;
    deteriorationStatus: string;
  };
  maintenancePriority: {
    priority: string;
    label: string;
    reason: string;
  };
  aiSummary: string;
  recommendations: string[];
}

export default function ReportView() {
  const { inspectionId } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inspectionId) {
      setLoading(false);
      return;
    }

    api
      .get(`/api/reports/${inspectionId}`)
      .then((res) => {
        setReport(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [inspectionId]);

  if (loading) {
    return (
      <p style={{ color: "var(--color-ink-muted)" }}>
        Loading report…
      </p>
    );
  }

  if (!report) {
    return (
      <p style={{ color: "var(--color-ink-muted)" }}>
        Report not found.
      </p>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>
        Inspection Report
      </h1>

      <p
        style={{
          fontSize: 13,
          color: "var(--color-ink-muted)",
          marginBottom: 24,
          fontFamily: "var(--font-mono)",
        }}
      >
        {report.header.inspectionId} · {report.asset.assetId} —{" "}
        {report.asset.name}
      </p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>
          Overall Assessment
        </h2>

        <p style={{ fontSize: 14 }}>
          Risk:{" "}
          <strong>{report.overallAssessment.riskLevel}</strong>{" "}
          ({report.overallAssessment.riskScore}/100)
          <br />
          Deterioration:{" "}
          {report.overallAssessment.deteriorationStatus}
          <br />
          Maintenance Priority:{" "}
          <strong>{report.maintenancePriority.priority}</strong> —{" "}
          {report.maintenancePriority.label}
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>
          Detected Defects
        </h2>

        {report.defects.map((defect, index) => (
          <div
            key={index}
            style={{
              fontSize: 14,
              padding: "6px 0",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {defect.type} —{" "}
            {(defect.confidence * 100).toFixed(1)}% confidence —{" "}
            {defect.severity}
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>
          Summary
        </h2>

        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          {report.aiSummary}
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 15, marginBottom: 8 }}>
          Recommendations
        </h2>

        <ul style={{ fontSize: 14, paddingLeft: 20 }}>
          {report.recommendations.map((recommendation, index) => (
            <li key={index} style={{ marginBottom: 4 }}>
              {recommendation}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}