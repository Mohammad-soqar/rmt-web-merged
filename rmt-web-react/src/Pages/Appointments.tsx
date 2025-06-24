// AppointmentsPage.tsx
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import * as enUS from "date-fns/locale/en-US";
import "../CSS/Appointment.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse: (value: string, formatString: string) =>
    parse(value, formatString, new Date()),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface AppointmentRaw {
  id: string;
  dateTime: { seconds: number; nanoseconds: number };
  notes: string;
}

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/ShowAppointment", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data: AppointmentRaw[]) => {
        const mapped = data.map((a) => {
          const start = new Date(a.dateTime.seconds * 1000);
          const end = new Date(start.getTime() + 30 * 60 * 1000);
          return {
            id: a.id,
            title: a.notes || "Appointment",
            start,
            end,
          };
        });
        setAppointments(mapped);
      })
      .catch((err) => console.error("Error loading appointments:", err));
  }, []);

  return (
    <div className="appointments-page">
      <header className="appointments-header">
        <h2>My Appointments</h2>
        <div className="appointments-controls">
          <button
            onClick={() => setShowList(false)}
            className="btn-app"
          >
            Calendar View
          </button>
          <button
            onClick={() => setShowList(true)}
            className="btn btn-secondary"
          >
            List View
          </button>
          <button
            onClick={() => {
              /* open add-appointment modal */
            }}
            className="btn-app"
          >
            Add Appointment
          </button>
        </div>
      </header>

      {showList ? (
        <div className="appointments-list-view">
          {appointments.length ? (
            <ul>
              {appointments.map((appt) => (
                <li key={appt.id} className="appointment-item">
                  <strong>{appt.start.toLocaleString()}</strong> — {appt.title}
                  <button
                    onClick={() =>
                      (window.location.href = `/appointments/${appt.id}`)
                    }
                    className="btn btn-link"
                  >
                    Details
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No appointments available.</p>
          )}
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.WEEK}
          style={{ height: "80vh", margin: "20px" }}
          onSelectEvent={(event) =>
            (window.location.href = `/appointments/${
              (event as Appointment).id
            }`)
          }
          selectable
          onSelectSlot={(slotInfo) => {
            console.log("New slot:", slotInfo.start);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
