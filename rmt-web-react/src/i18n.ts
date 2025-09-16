import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// ✅ import JSONs directly
import trCommon from "./locales/tr/common.json";
import trSidebar from "./locales/tr/sidebar.json";
import trCreatePatient from "./locales/tr/createPatient.json";
import trPatientsList from "./locales/tr/patientsList.json";
import trPatientDetail from "./locales/tr/patientDetail.json";
import PatientDetail from "./components/PatientDetail";
import trAppointment from "./locales/tr/appointment.json";
import trAppointmentDetail from "./locales/tr/appointmentDetail.json";
import trGlove from "./locales/tr/glove.json";


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    resources: {
      tr: {
        common: trCommon,
        sidebar: trSidebar,
        createPatient: trCreatePatient,
        patientsList: trPatientsList,
        patientDetail: trPatientDetail,
        appointment: trAppointment,
        appointmentDetail: trAppointmentDetail,
        glove: trGlove,
      },
    },
    ns: ["common", "sidebar","createPatient","patientsList", "patientDetail","appointment", "appointmentDetail","glove" ],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
