import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import Alert from "../components/Alert";
import "../CSS/CreatePatient.css";
import SelectField from "../components/SelectField";
import { useTranslation } from "react-i18next";

const CreatePatient: React.FC = () => {
  const { t, i18n } = useTranslation("createPatient"); // ✅ get i18n object too
  const currentLang = i18n.language;

  // ✅ helper: if lang is Turkish → use translations, else fallback English
  const translate = (key: string, fallback: string, vars: any = {}): string =>
    i18n.language === "tr" ? String(t(key, vars)) : fallback;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError(translate("errors.passwordMismatch", "Passwords do not match."));
      return;
    }
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !gender ||
      !age ||
      !nationality ||
      !birthDate ||
      !phonenumber ||
      !emergencyContact
    ) {
      setError(
        translate(
          "errors.requiredFields",
          "Please fill in all required fields."
        )
      );
      return;
    }

    const payload = {
      fullName,
      email,
      password,
      gender,
      age,
      nationality,
      birthDate,
      phonenumber,
      emergencyContact,
    };

    try {
      const response = await fetch("http://localhost:5000/createPatient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await response.json();
        setMessage(
          translate("success", "Patient account created successfully!")
        );
      } else {
        const errorData = await response.json();
        setError(
          errorData.error ||
            translate("errors.failed", "Patient creation failed.")
        );
      }
    } catch (err: any) {
      setError(
        err.message ||
          translate("errors.server", "Error connecting to the server.")
      );
    }
  };

  return (
    <div className="create-patient-page">
      <div className="CreatePatientHeader">
        <img src="../../public/user.png" alt="User" />
        {translate("title", "Create Patient")}
      </div>
      <div className="CreatePatientBody">
        <form
          id="create-patient-form"
          className="form-container"
          onSubmit={handleSubmit}
        >
          {/* Row 1 */}
          <div className="inputContainer1">
            <TextField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.fullName", "Full Name")}
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="inputContainer1">
            <TextField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.age", "Age")}
              name="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div className="inputContainer1">
            <TextField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.nationality", "Nationality")}
              name="nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
            />
          </div>
          {/* Row 2 */}
          <div className="inputContainer1">
            <TextField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.birthDate", "Birth Date")}
              name="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>
          <div className="inputContainer1">
            <TextField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.phone", "Phone Number")}
              name="phonenumber"
              type="tel"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              required
            />
          </div>
          <div className="inputContainer1">
            <TextField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.emergencyContact", "Emergency Number")}
              name="emergencyContact"
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              required
            />
          </div>
          {/* Row 3 */}
          <div className="inputContainer1">
            <TextField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.email", "Email")}
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="inputContainer1">
            <TextField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.password", "Password")}
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="inputContainer1">
            <TextField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.confirmPassword", "Confirm Password")}
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {/* Row 4 */}
          <div className="inputContainer1">
            <SelectField
              containerClassName="inputContainer"
              labelClassName="inputLabel"
              label={translate("fields.gender", "Gender")}
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                {
                  label: translate("fields.selectGender", "Select gender"),
                  value: "",
                },
                { label: translate("fields.male", "Male"), value: "male" },
                {
                  label: translate("fields.female", "Female"),
                  value: "female",
                },
              ]}
              required
            />
          </div>
        </form>
        <hr className="grid-divider" />
        <div className="button-container">
          <button
            type="submit"
            form="create-patient-form"
            className="CreatePatientButton"
          >
            {translate("submit", "Create Patient Account")}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-popup">
          <Alert
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        </div>
      )}
      {message && (
        <div className="alert-popup">
          <Alert
            type="success"
            message={message}
            onDismiss={() => setMessage(null)}
          />
        </div>
      )}
    </div>
  );
};

export default CreatePatient;
