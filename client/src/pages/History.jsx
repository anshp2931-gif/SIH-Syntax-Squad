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
    <div className="container" style={styles.container}>
      <div className="pageHeader" style={styles.header}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>Verification Audit Log</h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "4px" }}>
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
        <div className="searchBox" style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by Verification ID, Document, File..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="searchInput" style={styles.searchInput}
          />
        </div>

        <div className="filterGroup" style={styles.filterGroup}>
          <Filter size={16} color="#64748b" />
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
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading audit records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
            No matching verification audit records found.
          </div>
        ) : (
          <table className="table" style={styles.table}>
            <thead>
              <tr className="thRow" style={styles.thRow}>
                <th className="th" style={styles.th}>VERIFICATION ID</th>
                <th className="th" style={styles.th}>DOCUMENT</th>
                <th className="th" style={styles.th}>STATUS</th>
                <th className="th" style={styles.th}>ORIGINALITY SCORE</th>
                <th className="th" style={styles.th}>TIMESTAMP</th>
                <th className="th" style={styles.th}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec.verificationId} className="tr" style={styles.tr}>
                  <td className="td code-font" style={styles.td}>
                    <strong style={{ color: "#2563eb" }}>{rec.verificationId}</strong>
                  </td>
                  <td className="td" style={styles.td}>
                    {rec.documentType === "PAN"
                      ? "PAN Card"
                      : rec.documentType === "DRIVING_LICENSE"
                      ? "Driving Licence"
                      : rec.documentType}
                  </td>
                  <td className="td" style={styles.td}>
                    <ResultBadge status={rec.status} originalityScore={rec.originalityScore !== undefined ? rec.originalityScore : Math.max(0, 100 - rec.riskScore)} />
                  </td>
                  <td className="td" style={styles.td}>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      {rec.originalityScore !== undefined ? rec.originalityScore : Math.max(0, 100 - rec.riskScore)}
                    </span> / 100
                  </td>
                  <td className="td" style={styles.td}>
                    {new Date(rec.createdAt).toLocaleString()}
                  </td>
                  <td className="td" style={styles.td}>
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
        <div className="modalOverlay" style={styles.modalOverlay} onClick={() => setSelectedRecord(null)}>
          <div className="modalCard" style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" style={styles.closeBtn} onClick={() => setSelectedRecord(null)}>
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
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "36px 28px 60px 28px"
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
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    padding: "8px 16px",
    borderRadius: "8px",
    flex: 1,
    maxWidth: "420px"
  },
  searchInput: {
    background: "transparent",
    border: "none",
    color: "#0f172a",
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
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "0.78rem",
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  filterChipActive: {
    background: "#eff6ff",
    color: "#2563eb",
    borderColor: "#bfdbfe"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  thRow: {
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0"
  },
  th: {
    padding: "14px 20px",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.05em"
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s ease"
  },
  td: {
    padding: "14px 20px",
    fontSize: "0.88rem",
    color: "#334155"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(6px)",
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
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
  }
};
