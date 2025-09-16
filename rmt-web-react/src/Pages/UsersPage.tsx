import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/UsersPage.css";
import { useTranslation } from "react-i18next";

interface Patient {
  id: string;
  fullName: string;
  email: string;
  phonenumber: string;
  emergencyContact: string;
}

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const { t, i18n } = useTranslation("patientsList");
  const translate = (key: string, fallback: string, vars: any = {}): string =>
    i18n.language === "tr" ? String(t(key, vars)) : fallback;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://localhost:5000/showPatients", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        } else {
          const errorData = await response.json();
          setError(
            errorData.error || translate("errorLoad", "Failed to load patients")
          );
        }
      } catch {
        setError(translate("errorServer", "Error connecting to the server"));
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading)
    return (
      <div className="patients-loading">
        {translate("loading", "Loading patients...")}
      </div>
    );
  if (error) return <div className="patients-error">Error: {error}</div>;

  return (
    <div className="patients-page">
      <header className="patients-header">
        <h1>{translate("title", "PATIENTS")}</h1>
        <p>{translate("subtitle", "List of registered patients")}</p>
      </header>

      <div className="patients-toolbar">
        <button title="Columns" className="toolbar-btn">
          {translate("toolbar.columns", "Columns")}
        </button>
        <button title="Filters" className="toolbar-btn">
          {translate("toolbar.filters", "Filters")}
        </button>
        <button
          title="Create Patient"
          className="toolbar-btn"
          onClick={() => navigate("/create-patient")}
        >
          {translate("toolbar.create", "Create Patient")}
        </button>
        <button title="Export" className="toolbar-btn">
          {translate("toolbar.export", "Export")}
        </button>
      </div>

      <div className="patients-table-wrapper">
        <table className="patients-table">
          <thead>
            <tr>
              <th>{translate("table.fullName", "Full Name")}</th>
              <th>{translate("table.email", "Email")}</th>
              <th>{translate("table.phone", "Phone")}</th>
              <th>
                {translate("table.emergencyContact", "Emergency Contact")}
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <td>{patient.fullName}</td>
                <td>{patient.email}</td>
                <td>{patient.phonenumber}</td>
                <td>{patient.emergencyContact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientsList;
