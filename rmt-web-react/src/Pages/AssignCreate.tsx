import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import Alert from "../components/Alert";
import Switch from "../components/Switch";
import SearchableSelect from "../components/searchPatient";
import styles from "../CSS/AssignCreate.module.css";
import { useTranslation } from "react-i18next";

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

  const { t, i18n } = useTranslation("glove");
  const translate = (key: string, fallback: string, vars: any = {}): string =>
    i18n.language === "tr" ? String(t(key, vars)) : fallback;

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
      setError(
        translate(
          "messages.selectBoth",
          "Please select both a patient and a glove."
        )
      );
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/gloves/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gloveId: selectedGlove,
          patientId: selectedPatient,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.error || translate("messages.assignError", "Assignment failed.")
        );
      }
      await res.json();
      setMessage(
        translate("messages.assignSuccess", "Glove assigned successfully!")
      );
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!model || !productionDate || !version) {
      setError(
        translate("messages.required", "Please fill in all required fields.")
      );
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
        throw new Error(
          err.error ||
            translate("messages.createError", "Glove creation failed.")
        );
      }
      await res.json();
      setMessage(
        translate("messages.createSuccess", "Glove created successfully!")
      );
    } catch (e: any) {
      setError(e.message);
    }
  };

  // build options arrays
  const patientOptions = [
    { label: translate("selectPatient", "Select patient"), value: "" },
    ...patients.map((p) => ({
      label: p.fullName || p.id,
      value: p.id,
    })),
  ];
  const gloveOptions = [
    { label: translate("selectGlove", "Select glove"), value: "" },
    ...gloves.map((g) => ({
      label: g.model ? `${g.model} — ${g.status}` : g.id,
      value: g.id,
    })),
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {isAssignMode
          ? translate("assignTitle", "Assign Glove to Patient")
          : translate("createTitle", "Create New Glove")}
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
              label={translate("selectPatient", "Select Patient")}
              options={patientOptions}
              value={selectedPatient}
              onChange={setSelectedPatient}
              placeholder={translate("searchPlaceholder", "Type to search…")}
              required
            />

            <SearchableSelect
              label={translate("selectGlove", "Select Glove")}
              options={gloveOptions}
              value={selectedGlove}
              onChange={setSelectedGlove}
              placeholder={translate("searchPlaceholder", "Type to search…")}
              required
            />

            <div className={styles.assignBtnContainer}>
              <button type="submit" className={styles.assignBtn}>
                {translate("assignBtn", "Assign")}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.formField}>
              <TextField
                label={translate("model", "Model")}
                name="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
            <div className={styles.formField}>
              <TextField
                label={translate("productionDate", "Production Date")}
                name="productionDate"
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                required
              />
            </div>
            <div className={styles.formField}>
              <TextField
                label={translate("version", "Version")}
                name="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
              />
            </div>
            <div className={styles.createBtnContainer}>
              <button type="submit" className={styles.createBtn}>
                {translate("createBtn", "Create Glove")}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default AssignCreate;
