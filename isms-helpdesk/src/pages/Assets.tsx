import { useEffect, useRef, useState } from "react";
import { Card, Typography, Button, Alert, Box, CircularProgress } from "@mui/material";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

type WorksheetInstance = { getData: () => (string | number)[][] };

export default function Assets() {
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const sheetRef = useRef<WorksheetInstance[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/assets", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const savedRows = res.data.map((r: Record<string, string>) => [
          r.asset_id || "", r.asset_name || "", r.asset_type || "", r.owner || "",
          r.custodian || "", r.classification || "", r.criticality || "", r.location || "", r.status || "",
        ]);
        const padded = [...savedRows];
        while (padded.length < 10) padded.push(["", "", "", "", "", "", "", "", ""]);

        if (containerRef.current && !initialized.current) {
          initialized.current = true;
          const instance = jspreadsheet(containerRef.current, {
            worksheets: [
              {
                data: padded,
                columns: [
                  { type: "text", title: "Asset ID", width: 100 },
                  { type: "text", title: "Asset Name", width: 160 },
                  { type: "dropdown", title: "Asset Type", width: 130, source: ["Hardware", "Software", "Information", "Service", "People", "Facility"] },
                  { type: "text", title: "Owner", width: 150 },
                  { type: "text", title: "Custodian", width: 150 },
                  { type: "dropdown", title: "Classification", width: 130, source: ["Public", "Internal", "Confidential", "Restricted"] },
                  { type: "dropdown", title: "Criticality", width: 110, source: ["Low", "Medium", "High", "Critical"] },
                  { type: "text", title: "Location", width: 150 },
                  { type: "dropdown", title: "Status", width: 120, source: ["Active", "Inactive", "In Repair", "Retired", "Disposed"] },
                ],
                minDimensions: [9, 10],
              },
            ],
          });
          sheetRef.current = instance as unknown as WorksheetInstance[];
        }
      })
      .catch((err) => {
        console.error("Load error:", err);
        setError("Failed to load asset register");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (!sheetRef.current || !sheetRef.current[0]) {
      setError("Spreadsheet not ready yet — try again in a moment.");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const data = sheetRef.current[0].getData();
      await axios.put("/api/assets", { rows: data }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Asset register saved.");
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save asset register");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Asset Register (ISO/IEC 27001:2022 — Annex A 5.9)
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Inventory of information and other associated assets. Click any cell to edit, then Save.
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
      ) : (
        <div ref={containerRef} />
      )}
    </Card>
  );
}
