import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../CSS/PatientDetail.css";
import { useTranslation } from "react-i18next";

interface Appointment {
  id: string;
  dateTime: Date;
  description: string;
}

interface Report {
  id: string;
  reportUrl?: string;
  appointmentId?: string | null;
  createdAt?: string | null; // ✅ ISO string from backend
}

interface PatientDetailData {
  id: string;
  fullName: string;
  email: string;
  phonenumber: string;
  emergencyContact: string;
  profilePictureUrl?: string;
  appointments: Appointment[];
}

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PatientDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const { t, i18n } = useTranslation("patientDetail");
  const translate = (key: string, fallback: string, vars: any = {}): string =>
    i18n.language === "tr" ? String(t(key, vars)) : fallback;

  // ✅ Format ISO string → localized date
  const formatDate = (iso?: string | null) => {
    if (!iso) return translate("reports.unknownDate", "Unknown date");
    const date = new Date(iso);
    return date.toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Format appointment Date
  const formatDateTime = (date: Date) => {
    return date.toLocaleString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!patientId) return;
    const fetchDetail = async () => {
      try {
        const resp = await fetch(
          `http://localhost:5000/showPatients/${patientId}`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!resp.ok) throw new Error("Failed to load patient details");
        const json = await resp.json();

        const appointments: Appointment[] = (json.appointments || []).map(
          (a: any) => {
            let dt: Date;
            if (a.dateTime?.seconds != null) {
              dt = new Date(a.dateTime.seconds * 1000);
            } else {
              dt = new Date(a.dateTime);
            }
            return {
              id: a.id,
              dateTime: dt,
              description: a.notes || a.description || "",
            };
          }
        );

        setData({
          id: json.id,
          fullName: json.fullName,
          email: json.email,
          phonenumber: json.phonenumber,
          emergencyContact: json.emergencyContact,
          profilePictureUrl: json.profilePictureUrl,
          appointments,
        });
      } catch (e: any) {
        setError(e.message || translate("error", "Error loading patient"));
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    const fetchReports = async () => {
      try {
        const resp = await fetch(
          `http://localhost:5000/api/reports/patient/${patientId}`,
          { credentials: "include" }
        );
        if (!resp.ok) throw new Error("Failed to load reports");
        const json = await resp.json();
        setReports(json); // ✅ backend already sorted
      } catch (e: any) {
        console.error("Failed to fetch reports", e.message);
      } finally {
        setReportsLoading(false);
      }
    };
    fetchReports();
  }, [patientId]);

  const handleGenerateReport = async () => {
    if (!patientId) return;
    try {
      setReportsLoading(true);
      const resp = await fetch(`http://localhost:5000/generate_report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
        credentials: "include",
      });
      if (!resp.ok)
        throw new Error(`Failed to generate report (${resp.status})`);

      alert(
        translate("messages.generateSuccess", "Report generated successfully!")
      );

      // Refetch reports
      const reportsResp = await fetch(
        `http://localhost:5000/api/reports/patient/${patientId}`,
        { credentials: "include" }
      );
      if (!reportsResp.ok) throw new Error("Failed to refresh reports");
      const reportsJson = await reportsResp.json();
      setReports(reportsJson);
    } catch (err) {
      console.error("🔥 FULL ERROR STACK:", err);
      setError(
        translate("messages.generateError", "Failed to generate report")
      );
    } finally {
      setReportsLoading(false);
    }
  };

  if (loading)
    return (
      <div className="detail-loading">
        {translate("loading", "Loading patient...")}
      </div>
    );
  if (error) return <div className="detail-error">{`Error: ${error}`}</div>;
  if (!data)
    return (
      <div className="detail-error">
        {translate("notFound", "No patient found.")}
      </div>
    );

  const {
    fullName,
    email,
    phonenumber,
    emergencyContact,
    profilePictureUrl,
    appointments,
  } = data;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate("/patients")}>
        {translate("back", "← Back")}
      </button>

      <div className="detail-header">
        <img
          className="detail-avatar"
          src={profilePictureUrl || "/rmtsGlove.svg"}
          alt={fullName}
        />
        <div className="detail-info">
          <h2>{fullName}</h2>
          <p>
            {translate("email", "Email")}: {email}
          </p>
          <p>
            {translate("phone", "Phone")}: {phonenumber}
          </p>
          <p>
            {translate("emergency", "Emergency")}: {emergencyContact}
          </p>
        </div>
      </div>

      <section className="detail-section">
        <h3>{translate("appointments.title", "Upcoming Appointments")}</h3>
        {appointments.length > 0 ? (
          <div className="appointments-list">
            {appointments.map((a) => (
              <Link
                to={`/appointments/${a.id}`}
                key={a.id}
                className="appt-card-link"
              >
                <div className="appt-card">
                  <div className="appt-icon">📅</div>
                  <div className="appt-body">
                    <p className="appt-date">{formatDateTime(a.dateTime)}</p>
                    <p className="appt-desc">{a.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>{translate("appointments.none", "No upcoming appointments.")}</p>
        )}
      </section>

      <section className="detail-section">
        <h3>{translate("reports.title", "Patient Reports")}</h3>
        <button
          onClick={handleGenerateReport}
          className="generate-report-btn"
          disabled={reportsLoading}
        >
          {translate("reports.generate", "Generate Report")}
        </button>
        {reportsLoading ? (
          <p>{translate("reports.loading", "Loading reports...")}</p>
        ) : reports.length > 0 ? (
          <div className="reports-list">
            {reports.map((r) => (
              <Link
                to={`/patients/${patientId}/reports/${r.id}`}
                key={r.id}
                className="report-item"
              >
                <p>
                  <strong>
                    {translate("reports.createdAt", "Created at")}:
                  </strong>{" "}
                  {formatDate(r.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p>{translate("reports.none", "No reports available.")}</p>
        )}
      </section>
    </div>
  );
};

export default PatientDetail;
