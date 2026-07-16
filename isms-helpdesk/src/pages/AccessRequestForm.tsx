import { useState, useEffect, useCallback } from "react";
import {
  Card, TextField, Button, Typography, Box, Alert, Snackbar,
  Autocomplete, FormControlLabel, Checkbox, FormGroup, MenuItem,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface EmployeeOption {
  cpf: string;
  name: string;
  designation: string | null;
}

export default function AccessRequestForm() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [requestType, setRequestType] = useState<"create" | "delete">("create");

  const [financialYears, setFinancialYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");

  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [cpfInput, setCpfInput] = useState("");

  const [form, setForm] = useState({
    request_date: new Date().toISOString().slice(0, 10),
    username: "",
    machine_list: "",
    remark: "",
  });
  const [userTypeLDAP, setUserTypeLDAP] = useState(false);
  const [userTypeOS, setUserTypeOS] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/employees/years", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setFinancialYears(res.data);
        if (res.data.length > 0) setSelectedYear(res.data[0]);
      })
      .catch(() => {});
  }, [token]);

  const searchEmployees = useCallback(async (query: string) => {
    if (!query || query.length < 1) { setEmployeeOptions([]); return; }
    try {
      const yearParam = selectedYear ? `&year=${encodeURIComponent(selectedYear)}` : "";
      const res = await axios.get(`/api/employees/search?q=${encodeURIComponent(query)}${yearParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeeOptions(res.data);
    } catch {
      setEmployeeOptions([]);
    }
  }, [token, selectedYear]);

  useEffect(() => {
    const timeout = setTimeout(() => searchEmployees(cpfInput), 300);
    return () => clearTimeout(timeout);
  }, [cpfInput, searchEmployees]);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedEmployee) { setError("Please select a CPF / employee name"); return; }
    if (requestType === "create" && !userTypeLDAP && !userTypeOS) {
      setError("Please select at least one Type of User");
      return;
    }

    setLoading(true);
    try {
      const user_type = [userTypeLDAP && "LDAP", userTypeOS && "OS"].filter(Boolean).join(", ");
      const res = await axios.post("/api/requests", {
        employee_name: selectedEmployee.name,
        cpf_no: selectedEmployee.cpf,
        request_date: form.request_date,
        username: requestType === "create" ? form.username : undefined,
        user_type: requestType === "create" ? user_type : undefined,
        machine_list: requestType === "create" ? form.machine_list : undefined,
        remark: form.remark,
        request_type: requestType,
        financial_year: selectedYear,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmittedId(res.data.id);
      setSuccess(true);
      setSelectedEmployee(null);
      setUserTypeLDAP(false);
      setUserTypeOS(false);
      setForm({
        request_date: new Date().toISOString().slice(0, 10),
        username: "", machine_list: "", remark: "",
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Submission failed");
      else setError("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!submittedId) return;
    window.open(`${import.meta.env.VITE_API_URL}/api/requests/${submittedId}/pdf?token=${token}`, "_blank");
  };

  return (
    <Card sx={{ p: 3, maxWidth: 560 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        {requestType === "create" ? "New User Creation" : "User Deletion Request"}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        {requestType === "create"
          ? "Fill in the form — the E1 approver will review and approve your request."
          : "Request that an existing user's access be removed. The E1 approver will review before deactivation."}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Request Type"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as "create" | "delete")}
            fullWidth
          >
            <MenuItem value="create">Create User</MenuItem>
            <MenuItem value="delete">Delete User</MenuItem>
          </TextField>

          <TextField
            select
            label="Financial Year"
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setSelectedEmployee(null); }}
            fullWidth
          >
            {financialYears.length === 0 && <MenuItem value="">No years available</MenuItem>}
            {financialYears.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>

          <Autocomplete
            options={employeeOptions}
            getOptionLabel={(option) => `${option.cpf} | ${option.name}`}
            value={selectedEmployee}
            onChange={(_, newValue) => setSelectedEmployee(newValue)}
            onInputChange={(_, newInputValue) => setCpfInput(newInputValue)}
            isOptionEqualToValue={(option, value) => option.cpf === value.cpf}
            renderInput={(params) => (
              <TextField {...params} label="CPF / Name" required placeholder="Type CPF or name..." />
            )}
            noOptionsText={cpfInput ? "No matching employees" : "Start typing a CPF or name"}
          />

          <TextField
            label="Date"
            type="date"
            fullWidth
            required
            value={form.request_date}
            onChange={update("request_date")}
            InputLabelProps={{ shrink: true }}
          />

          {requestType === "create" && (
            <>
              <TextField
                label="Username"
                value={form.username}
                onChange={update("username")}
                required
                fullWidth
              />

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
                  Type of User
                </Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={<Checkbox checked={userTypeLDAP} onChange={(e) => setUserTypeLDAP(e.target.checked)} />}
                    label="LDAP"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={userTypeOS} onChange={(e) => setUserTypeOS(e.target.checked)} />}
                    label="OS"
                  />
                </FormGroup>
              </Box>

              <TextField
                label="Machine List"
                value={form.machine_list}
                onChange={update("machine_list")}
                fullWidth
              />
            </>
          )}

          <TextField
            label={requestType === "create" ? "Remarks" : "Reason for deletion"}
            value={form.remark}
            onChange={update("remark")}
            fullWidth
            multiline
            rows={3}
            required={requestType === "delete"}
          />

          <Button type="submit" variant="contained" disabled={loading} color={requestType === "delete" ? "error" : "primary"}>
            {loading ? "Submitting..." : requestType === "create" ? "Submit" : "Submit Deletion Request"}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={success}
        autoHideDuration={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" color="inherit" onClick={handleDownloadPDF}>Download PDF</Button>
              <Button size="small" color="inherit" onClick={() => { setSuccess(false); navigate("/requests"); }}>
                View Requests
              </Button>
            </Box>
          }
        >
          Request #{submittedId} submitted successfully.
        </Alert>
      </Snackbar>
    </Card>
  );
}
