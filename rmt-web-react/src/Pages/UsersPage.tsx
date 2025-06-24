import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/UsersPage.css";

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
          setError(errorData.error || "Failed to load patients");
        }
      } catch {
        setError("Error connecting to the server");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading)
    return <div className="patients-loading">Loading patients...</div>;
  if (error) return <div className="patients-error">Error: {error}</div>;

  return (
    <div className="patients-page">
      <header className="patients-header">
        <h1>PATIENTS</h1>
        <p>List of registered patients</p>
      </header>

      <div className="patients-toolbar">
        <button title="Columns" className="toolbar-btn">
          Columns
        </button>
        <button title="Filters" className="toolbar-btn">
          Filters
        </button>
        <button
          title="Create Patient"
          className="toolbar-btn"
          onClick={() => navigate("/create-patient")}
        >
          Create Patient
        </button>
        <button title="Export" className="toolbar-btn">
          Export
        </button>
      </div>

      <div className="patients-table-wrapper">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Emergency Contact</th>
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
