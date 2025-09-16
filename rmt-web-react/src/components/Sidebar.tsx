// Sidebar.tsx
import React from "react";
import "../CSS/sidebar.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Sidebar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["sidebar", "common"]);

  const handleLogout = () => {
    navigate("/login");
  };

  // ✅ helper to fallback to English if not Turkish
  const translate = (key: string, ns: string, fallback: string) =>
    i18n.language === "tr" ? t(key, { ns }) : fallback;

  return (
    <div className="sidebar">
      <div className="sidebar-header"></div>
      <nav className="sidebar-nav">
        <ul>
          <div>
            <img src="./src/assets/GLOVELOGO.png" className="sidebar-logo" />
          </div>
          <li>
            <img src="/user.png" />
            <Link to="/create-patient">
              {translate("createPatient", "sidebar", "Create Patient")}
            </Link>
          </li>
          <li>
            <img src="/users.png" />
            <Link to="/patients">
              {translate("patientsList", "sidebar", "Patients List")}
            </Link>
          </li>
          <li>
            <img src="/glove.png" />
            <Link to="/AssignCreate">
              {translate("gloveManagement", "sidebar", "Glove Management")}
            </Link>
          </li>
          <li>
            <img src="/calendar.png" />
            <Link to="/appointments">
              {translate("appointments", "sidebar", "Appointments")}
            </Link>
          </li>
        </ul>

        <div className="horizentalline" />
        <div className="logout">
          <img src="/exit.png" alt="Exit" />
          <button className="logoutButton" onClick={handleLogout}>
            {translate("logout", "common", "Logout")}
          </button>
        </div>

        <div className="mt-auto">
          <LanguageSwitcher />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
