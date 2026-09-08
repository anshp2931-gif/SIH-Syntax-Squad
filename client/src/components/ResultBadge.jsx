import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function ResultBadge({ status, riskScore }) {
  if (status === "VERIFIED") {
    return (
      <div className="badge-verified">
        <CheckCircle2 size={17} color="#16A34A" />
        <span style={{ fontWeight: 700 }}>VERIFIED</span>
        {riskScore !== undefined && (
          <span style={{ opacity: 0.85, fontSize: "0.75rem", marginLeft: "4px" }}>
            (Risk: {riskScore}/100)
          </span>
        )}
      </div>
    );
  }

  if (status === "UNVERIFIED") {
    return (
      <div className="badge-unverified">
        <AlertTriangle size={17} color="#F59E0B" />
        <span style={{ fontWeight: 700 }}>UNVERIFIED</span>
        {riskScore !== undefined && (
          <span style={{ opacity: 0.85, fontSize: "0.75rem", marginLeft: "4px" }}>
            (Risk: {riskScore}/100)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="badge-suspicious">
      <XCircle size={17} color="#DC2626" />
      <span style={{ fontWeight: 700 }}>SUSPICIOUS</span>
      {riskScore !== undefined && (
        <span style={{ opacity: 0.85, fontSize: "0.75rem", marginLeft: "4px" }}>
          (Risk: {riskScore}/100)
        </span>
      )}
    </div>
  );
}
