// Sidebar.tsx
import React from "react";
import "../CSS/sidebar.css";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Optionally, clear authentication tokens or perform other logout logic here
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header"></div>
      <nav className="sidebar-nav">
        <ul>
          <div className="profile"> <img src="./src/assets/rmt_logo.png" className="sidebar-logo"/></div>
          <li>
            <img src="/user.png" />
            <Link to="/create-patient">Create Patient</Link>
          </li>
          <li>
            <img src="/users.png" />
            <Link to="/patients">Patients List</Link>
          </li>

          <li>
            <img src="/glove.png" />
            <Link to="/AssignCreate">Glove Management</Link>
          </li>
          <li>
            <img src="/calendar.png" />
            <Link to="/appointments">Appointments</Link>
          </li>
        </ul>
        <div className="horizentalline" />
        <div className="logout">
          <img src="/exit.png " alt="Exit" />
          <button className="logoutButton" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
