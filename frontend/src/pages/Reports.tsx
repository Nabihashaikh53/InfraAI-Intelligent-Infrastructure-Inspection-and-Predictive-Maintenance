import { Link } from "react-router-dom";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

const savedReports = [
  {
    title: "Bandra Bridge — Jun 2024",
    date: "18 Jun 2024",
    status: "Ready",
  },
  {
    title: "Quarterly infrastructure summary",
    date: "01 Jun 2024",
    status: "Ready",
  },
  {
    title: "Bandra Bridge — Mar 2024",
    date: "22 Mar 2024",
    status: "Archived",
  },
];

export default function Reports() {
  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        paddingBottom: 40,
      }}
    >
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
            EVIDENCE & OUTPUT
          </div>

          <h1
            style={{
              fontSize: 32,
              lineHeight: 1.15,
              margin: 0,
              marginBottom: 12,
            }}
          >
            Reports that stand up in a review.
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "var(--color-ink-muted)",
              margin: 0,
            }}
          >
            Turn a finding into a shareable record for engineers, inspectors,
            and authorities.
          </p>
        </div>

        <button
          style={{
            border: 0,
            borderRadius: 7,
            background: "#F6AE24",
            color: "#17283D",
            padding: "13px 20px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ↓&nbsp; Exported
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.35fr) minmax(340px, 0.75fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        <section
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            background: "var(--color-surface)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "22px 22px 18px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.4,
                color: "var(--color-accent)",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              PREVIEW · PDF
            </div>

            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              Bandra Bridge — health assessment
            </div>
          </div>

          <div style={{ padding: 22 }}>
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: 26,
                background: "#fffdf8",
                boxShadow: "0 5px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                    }}
                  >
                    <span style={{ color: "var(--color-accent)" }}>
                      INFRA
                    </span>
                    AI
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: 1.2,
                      color: "var(--color-ink-muted)",
                      marginTop: 5,
                    }}
                  >
                    INFRASTRUCTURE HEALTH ASSESSMENT
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--color-ink-muted)",
                  }}
                >
                  <div>INS-1024</div>
                  <div>18 JUN 2024</div>
                </div>
              </div>

              <div
                style={{
                  height: 2,
                  background: "#17283D",
                  margin: "20px 0 24px",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 24,
                }}
              >
                <div>
                  <div className="report-label">SITE</div>
                  <strong>Bandra Bridge</strong>
                </div>

                <div>
                  <div className="report-label">HEALTH SCORE</div>
                  <strong style={{ color: "#C94F36" }}>78 / 100</strong>
                </div>

                <div>
                  <div className="report-label">STATUS</div>
                  <strong>Review now</strong>
                </div>
              </div>

              <div
                style={{
                  height: 9,
                  background: "#ebe9e1",
                  borderRadius: 999,
                  margin: "28px 0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "78%",
                    height: "100%",
                    background: "#D85A43",
                    borderRadius: 999,
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                EXECUTIVE FINDING
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: 16,
                  color: "#52657A",
                  fontSize: 13,
                  lineHeight: 2,
                }}
              >
                The latest inspection identifies a high-confidence structural
                crack and active corrosion. Risk has increased consistently
                over the last three inspections. A structural review is
                recommended before the next monsoon cycle.
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  marginTop: 24,
                  paddingTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "var(--color-ink-muted)",
                }}
              >
                <span>Prepared for Mumbai Civic Works</span>
                <span>Demo report · not a live model output</span>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              background: "var(--color-surface)",
              padding: 22,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.4,
                color: "var(--color-accent)",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              SAVED REPORTS
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {savedReports.map((report) => (
                <div
                  key={report.title}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 9,
                    padding: "15px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        marginBottom: 5,
                      }}
                    >
                      {report.title}
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      {report.date}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color:
                          report.status === "Archived"
                            ? "var(--color-ink-muted)"
                            : "#16818A",
                      }}
                    >
                      {report.status}
                    </span>

                    <span
                      style={{
                        fontSize: 16,
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      ↓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              background: "var(--color-surface)",
              padding: 22,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.4,
                color: "var(--color-accent)",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              REPORT WORKFLOW
            </div>

            <h2
              style={{
                fontSize: 18,
                margin: "0 0 12px",
              }}
            >
              Evidence → action
            </h2>

            <p
              style={{
                fontSize: 13,
                lineHeight: 1.8,
                color: "var(--color-ink-muted)",
                margin: "0 0 18px",
              }}
            >
              This preview keeps the finding, confidence, recommendation,
              and source inspection together.
            </p>

            <Link
              to="/inspection/new"
              style={{
                display: "block",
                textAlign: "center",
                padding: "13px 16px",
                borderRadius: 7,
                background: "#F6AE24",
                color: "#17283D",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              ▣&nbsp; Generate a fresh report
            </Link>
          </section>
        </div>
      </div>

      <style>
        {`
          .report-label {
            font-size: 10px;
            letter-spacing: 1.1px;
            color: var(--color-ink-muted);
            margin-bottom: 7px;
          }

          @media (max-width: 900px) {
            .report-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
}