import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import Alert from "../components/Alert";
import Switch from "../components/Switch";
import SearchableSelect from "../components/searchPatient"; // ← our new component
import styles from "../CSS/AssignCreate.module.css";

interface Patient {
  id: string;
  fullName?: string;
}
interface Glove {
  id: string;
  model?: string;
  status?: string;
}

const AssignCreate: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [gloves, setGloves] = useState<Glove[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedGlove, setSelectedGlove] = useState("");
  const [model, setModel] = useState("");
  const [productionDate, setProductionDate] = useState("");
  const [version, setVersion] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isAssignMode, setIsAssignMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("http://localhost:5000/showPatients");
        if (!res.ok) throw new Error("Failed to fetch patients");
        setPatients(await res.json());
      } catch (e: any) {
        setError(e.message);
      }
    };
    const fetchGloves = async () => {
      try {
        const res = await fetch("http://localhost:5000/showGloves");
        if (!res.ok) throw new Error("Failed to fetch gloves");
        setGloves(await res.json());
      } catch (e: any) {
        setError(e.message);
      }
    };
    fetchPatients();
    fetchGloves();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!selectedPatient || !selectedGlove) {
      setError("Please select both a patient and a glove.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/gloves/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gloveId: selectedGlove, patientId: selectedPatient }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Assignment failed.");
      }
      const data = await res.json();
      setMessage(`Glove assigned successfully! Glove ID: ${data.gloveId}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!model || !productionDate || !version) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/gloves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, productionDate, version }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Glove creation failed.");
      }
      const data = await res.json();
      setMessage(`Glove created successfully! ID: ${data.gloveId}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // build options arrays
  const patientOptions = [
    { label: "Select patient", value: "" },
    ...patients.map((p) => ({
      label: p.fullName || p.id,
      value: p.id,
    })),
  ];
  const gloveOptions = [
    { label: "Select glove", value: "" },
    ...gloves.map((g) => ({
      label: g.model ? `${g.model} — ${g.status}` : g.id,
      value: g.id,
    })),
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {isAssignMode ? "Assign Glove to Patient" : "Create New Glove"}
      </h1>

      <div className={styles.modeToggle}>
        <Switch
          checked={isAssignMode}
          onChange={() => {
            setError("");
            setMessage("");
            setIsAssignMode((m) => !m);
          }}
        />
      </div>

      {error && (
        <div className={styles.alertError}>
          <Alert type="error" message={error} />
        </div>
      )}
      {message && (
        <div className={styles.alertSuccess}>
          <Alert type="success" message={message} />
        </div>
      )}

      <form
        onSubmit={isAssignMode ? handleAssign : handleCreate}
        className={styles.formContainer}
      >
        {isAssignMode ? (
          <>
            <SearchableSelect
              label="Select Patient"
              options={patientOptions}
              value={selectedPatient}
              onChange={setSelectedPatient}
              placeholder="Type to search…"
              required
            />

            <SearchableSelect
              label="Select Glove"
              options={gloveOptions}
              value={selectedGlove}
              onChange={setSelectedGlove}
              placeholder="Type to search…"
              required
            />

            <div className={styles.assignBtnContainer}>
              <button type="submit" className={styles.assignBtn}>
                Assign
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.formField}>
              <TextField
                label="Model"
                name="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
            <div className={styles.formField}>
              <TextField
                label="Production Date"
                name="productionDate"
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                required
              />
            </div>
            <div className={styles.formField}>
              <TextField
                label="Version"
                name="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
              />
            </div>
            <div className={styles.createBtnContainer}>
              <button type="submit" className={styles.createBtn}>
                Create Glove
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default AssignCreate;
