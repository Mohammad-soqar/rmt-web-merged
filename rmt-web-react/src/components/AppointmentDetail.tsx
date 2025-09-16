import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../CSS/AppointmentDetail.css";
import { useTranslation } from "react-i18next";

interface AppointmentRaw {
  id: string;
  dateTime: { seconds: number; nanoseconds: number };
  notes: string;
  status: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
}

interface AppointmentDetail {
  id: string;
  start: Date;
  end: Date;
  notes: string;
  status: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentDetail: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [appt, setAppt] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ load only appointmentDetail namespace
  const { t } = useTranslation("appointmentDetail");

  useEffect(() => {
    if (!appointmentId) {
      setError("No appointment ID provided"); // ✅ hard-coded English
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/ShowAppointment/${appointmentId}`,
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: AppointmentRaw = await res.json();

        const start = new Date(data.dateTime.seconds * 1000);
        const end = new Date(start.getTime() + 30 * 60 * 1000);

        const patientRes = await fetch(
          `http://localhost:5000/showPatients/${data.patientId}`,
          { credentials: "include" }
        );
        const patientData = patientRes.ok
          ? await patientRes.json()
          : { fullName: data.patientId };

        setAppt({
          id: data.id,
          start,
          end,
          notes: data.notes,
          status: data.status,
          patientId: data.patientId,
          patientName: patientData.fullName,
          doctorId: data.doctorId,
          doctorName: data.doctorName,
          createdAt: new Date(data.createdAt.seconds * 1000),
          updatedAt: new Date(data.updatedAt.seconds * 1000),
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId]);

  if (loading) return <div>Loading...</div>; // ✅ hard-coded English
  if (error) return <div>Error: {error}</div>; // ✅ hard-coded English
  if (!appt) return <div>Not found</div>; // ✅ hard-coded English

  return (
    <div className="appt-detail">
      <Link to="/appointments" className="appt-detail__back">
        ← Back {/* ✅ hard-coded English */}
      </Link>

      <h1 className="appt-detail__title">Appointment Detail</h1>

      <div className="appt-detail__grid">
        <div className="appt-detail__item">
          <strong>{t("status")}:</strong> {t(`statuses.${appt.status}`)}
        </div>
        <div className="appt-detail__item">
          <strong>{t("start")}:</strong> {appt.start.toLocaleString()}
        </div>
        <div className="appt-detail__item">
          <strong>{t("end")}:</strong> {appt.end.toLocaleString()}
        </div>
        <div className="appt-detail__item appt-detail__notes">
          <strong>{t("notes")}:</strong>
          <p>{appt.notes || "—"}</p>
        </div>
        <div className="appt-detail__item">
          <strong>{t("patient")}:</strong> {appt.patientName}
        </div>
        <div className="appt-detail__item">
          <strong>{t("doctor")}:</strong> {appt.doctorName || "—"}
        </div>
        <div className="appt-detail__item">
          <strong>{t("created")}:</strong> {appt.createdAt.toLocaleString()}
        </div>
        <div className="appt-detail__item">
          <strong>{t("updated")}:</strong> {appt.updatedAt.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
