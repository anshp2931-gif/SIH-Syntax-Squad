import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function ResultBadge({ status, riskScore }) {
  if (status === "VERIFIED") {
    return (
      <div className="badge-verified">
        <CheckCircle2 size={18} />
        <span>VERIFIED</span>
        {riskScore !== undefined && (
          <span style={{ opacity: 0.8, fontSize: "0.75rem", marginLeft: "4px" }}>
            (Risk: {riskScore}/100)
          </span>
        )}
      </div>
    );
  }

  if (status === "UNVERIFIED") {
    return (
      <div className="badge-unverified">
        <AlertTriangle size={18} />
        <span>UNVERIFIED</span>
        {riskScore !== undefined && (
          <span style={{ opacity: 0.8, fontSize: "0.75rem", marginLeft: "4px" }}>
            (Risk: {riskScore}/100)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="badge-suspicious">
      <XCircle size={18} />
      <span>SUSPICIOUS</span>
      {riskScore !== undefined && (
        <span style={{ opacity: 0.8, fontSize: "0.75rem", marginLeft: "4px" }}>
          (Risk: {riskScore}/100)
        </span>
      )}
    </div>
  );
}
