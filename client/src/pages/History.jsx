import React, { useEffect, useState } from "react";
import { getVerificationHistoryApi } from "../services/api";
import ResultBadge from "../components/ResultBadge";
import VerificationCard from "../components/VerificationCard";
import { Search, Filter, RefreshCw, Eye, X } from "lucide-react";

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    getVerificationHistoryApi()
      .then((res) => {
        if (res?.data) setRecords(res.data);
      })
      .catch((err) => console.warn("Failed to fetch history:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.verificationId.toLowerCase().includes(search.toLowerCase()) ||
      rec.documentType.toLowerCase().includes(search.toLowerCase()) ||
      (rec.fileName && rec.fileName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Verification Audit Log</h1>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginTop: "4px" }}>
            Historical audit records stored in MongoDB / Verification Store
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchHistory} disabled={loading}>
          <RefreshCw size={16} className={loading ? "pulse-animation" : ""} />
          Refresh Log
        </button>
      </div>

      {/* Filter Controls */}
      <div className="glass-card" style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search by Verification ID, Document, File..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <Filter size={16} color="#9ca3af" />
          {["ALL", "VERIFIED", "UNVERIFIED", "SUSPICIOUS"].map((st) => (
            <button
              key={st}
              style={{
                ...styles.filterChip,
                ...(statusFilter === st ? styles.filterChipActive : {})
              }}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
            Loading audit records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
            No matching verification audit records found.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>VERIFICATION ID</th>
                <th style={styles.th}>DOCUMENT</th>
                <th style={styles.th}>STATUS</th>
                <th style={styles.th}>RISK SCORE</th>
                <th style={styles.th}>TIMESTAMP</th>
                <th style={styles.th}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec.verificationId} style={styles.tr}>
                  <td style={styles.td} className="code-font">
                    <strong>{rec.verificationId}</strong>
                  </td>
                  <td style={styles.td}>
                    {rec.documentType === "PAN"
                      ? "PAN Card"
                      : rec.documentType === "DRIVING_LICENSE"
                      ? "Driving Licence"
                      : rec.documentType}
                  </td>
                  <td style={styles.td}>
                    <ResultBadge status={rec.status} />
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 700 }}>{rec.riskScore}</span> / 100
                  </td>
                  <td style={styles.td}>
                    {new Date(rec.createdAt).toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <button
                      className="btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                      onClick={() => setSelectedRecord(rec)}
                    >
                      <Eye size={14} />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for detailed record viewing */}
      {selectedRecord && (
        <div style={styles.modalOverlay} onClick={() => setSelectedRecord(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelectedRecord(null)}>
              <X size={20} />
            </button>
            <VerificationCard result={{ data: selectedRecord }} />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "40px 24px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  filterBar: {
    padding: "16px 24px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap"
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(17, 24, 39, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "8px 16px",
    borderRadius: "8px",
    flex: 1,
    maxWidth: "420px"
  },
  searchInput: {
    background: "transparent",
    border: "none",
    color: "#fff",
    outline: "none",
    width: "100%",
    fontSize: "0.88rem"
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  filterChip: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#9ca3af",
    fontSize: "0.78rem",
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  filterChipActive: {
    background: "rgba(99, 102, 241, 0.2)",
    color: "#818cf8",
    borderColor: "rgba(99, 102, 241, 0.4)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  thRow: {
    background: "rgba(17, 24, 39, 0.8)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
  },
  th: {
    padding: "14px 20px",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#9ca3af",
    letterSpacing: "0.05em"
  },
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    transition: "background 0.2s ease"
  },
  td: {
    padding: "14px 20px",
    fontSize: "0.88rem"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "24px"
  },
  modalCard: {
    maxWidth: "800px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative"
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    color: "#fff",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10
  }
};
