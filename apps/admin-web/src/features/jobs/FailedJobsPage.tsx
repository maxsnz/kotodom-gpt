import { useState, useEffect, useCallback } from "react";
import { jobsApi, FailedJob } from "./api";

export function FailedJobsPage() {
  const [jobs, setJobs] = useState<FailedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await jobsApi.getFailedJobs(100);
      setJobs(response.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRetryAll = async () => {
    if (jobs.length === 0) return;

    const confirmed = window.confirm(
      `Retry ${jobs.length} failed job(s)? This will re-queue them for processing.`
    );
    if (!confirmed) return;

    setRetrying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await jobsApi.retryFailedJobs();
      setSuccessMessage(
        `Successfully retried ${result.retriedCount} job(s). New job IDs: ${result.jobIds.slice(0, 5).join(", ")}${result.jobIds.length > 5 ? "..." : ""}`
      );
      // Refresh the list
      await fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry jobs");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Failed Jobs</h1>
        <div style={styles.actions}>
          <button
            onClick={fetchJobs}
            disabled={loading}
            style={styles.refreshButton}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={handleRetryAll}
            disabled={retrying || jobs.length === 0}
            style={{
              ...styles.retryButton,
              opacity: jobs.length === 0 ? 0.5 : 1,
            }}
          >
            {retrying ? "Retrying..." : `Retry All (${jobs.length})`}
          </button>
        </div>
      </header>

      {error && <div style={styles.errorBanner}>{error}</div>}
      {successMessage && (
        <div style={styles.successBanner}>{successMessage}</div>
      )}

      {loading && jobs.length === 0 ? (
        <div style={styles.loadingState}>Loading failed jobs...</div>
      ) : jobs.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>✓</span>
          <p>No failed jobs found</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Job ID</th>
                <th style={styles.th}>Bot ID</th>
                <th style={styles.th}>Update ID</th>
                <th style={styles.th}>Chat ID</th>
                <th style={styles.th}>Text</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Error</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} style={styles.tr}>
                  <td style={styles.td}>
                    <code style={styles.code}>{job.id.slice(0, 8)}...</code>
                  </td>
                  <td style={styles.td}>{job.data.botId ?? "-"}</td>
                  <td style={styles.td}>{job.data.telegramUpdateId ?? "-"}</td>
                  <td style={styles.td}>{job.data.chatId ?? "-"}</td>
                  <td style={styles.td}>
                    <span style={styles.textPreview}>
                      {job.data.text?.slice(0, 30) ?? "-"}
                      {(job.data.text?.length ?? 0) > 30 ? "..." : ""}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(job.createdOn).toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <code style={styles.errorCode}>
                      {typeof job.output === "object" && job.output !== null
                        ? JSON.stringify(job.output).slice(0, 50)
                        : String(job.output ?? "-").slice(0, 50)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    margin: 0,
    color: "#1a1a2e",
  },
  actions: {
    display: "flex",
    gap: "12px",
  },
  refreshButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: 500,
    backgroundColor: "#f0f0f5",
    color: "#1a1a2e",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  retryButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: 500,
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  errorBanner: {
    padding: "16px",
    backgroundColor: "#fee",
    color: "#c00",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid #fcc",
  },
  successBanner: {
    padding: "16px",
    backgroundColor: "#efe",
    color: "#060",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid #cfc",
  },
  loadingState: {
    textAlign: "center",
    padding: "48px",
    color: "#666",
  },
  emptyState: {
    textAlign: "center",
    padding: "64px",
    color: "#666",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
  },
  emptyIcon: {
    fontSize: "48px",
    color: "#2ecc71",
    display: "block",
    marginBottom: "16px",
  },
  tableContainer: {
    overflowX: "auto",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #eee",
    fontSize: "13px",
    fontWeight: 600,
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tr: {
    borderBottom: "1px solid #f0f0f0",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#333",
  },
  code: {
    fontFamily: "monospace",
    fontSize: "12px",
    backgroundColor: "#f5f5f5",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  errorCode: {
    fontFamily: "monospace",
    fontSize: "11px",
    backgroundColor: "#fff0f0",
    color: "#c00",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  textPreview: {
    color: "#666",
    fontSize: "13px",
  },
};



