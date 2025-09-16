import React from "react";
import { Link } from "react-router-dom";

import "../CSS/dashboard.css";
import LanguageSwitcher from "../components/LanguageSwitcher";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
      {/* Button to navigate to create patient page */}
      <Link
        to="/create-patient"
        className="inline-block px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700"
      >
        Create Patient Account
      </Link>
      <Link
        to="/patients"
        className="inline-block px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700 Link"
      >
        View Your Patients
      </Link>
      <li>
        <Link to="/create-glove" className="text-blue-600 hover:underline">
          Create Glove
        </Link>
      </li>
      <li>
        <Link to="/profile" className="text-blue-600 hover:underline">
          Profile
        </Link>
      </li>
      <li>
        <Link to="/assign-glove" className="text-blue-600 hover:underline">
          Assign Glove
        </Link>
      </li>
      <li>
        <Link to="/appointments" className="text-blue-600 hover:underline">
          View Appointments
        </Link>
      </li>

      {/* Additional dashboard content can go here */}
    </div>
  );
};

export default Dashboard;
