import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import SelectField from "../components/SelectField";
import Alert from "../components/Alert";

const CreateGlove: React.FC = () => {
  const [model, setModel] = useState("");
  const [productionDate, setProductionDate] = useState("");
  const [status, setStatus] = useState("");
  const [version, setVersion] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!model || !productionDate || !status || !version) {
      setError("Please fill in all required fields.");
      return;
    }

    const payload = {
      model,
      productionDate,
      status,
      version,
    };

    try {
      const response = await fetch("http://localhost:5000/gloves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Glove created successfully! ID: " + data.gloveId);
        // Optionally, redirect after a short delay:
        // setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Glove creation failed.");
      }
    } catch (err: any) {
      setError(err.message || "Error connecting to the server.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Create Glove</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded shadow"
      >
        {error && <Alert type="error" message={error} />}
        {message && <Alert type="success" message={message} />}

        <TextField
          label="Model"
          name="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />

        <TextField
          label="Production Date"
          name="productionDate"
          type="date"
          value={productionDate}
          onChange={(e) => setProductionDate(e.target.value)}
          required
        />

        {/* <SelectField
          label="Status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: "Select status", value: "" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Maintenance", value: "maintenance" },
          ]}
          required
        /> */}

        <TextField
          label="Version"
          name="version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
        >
          Create Glove
        </button>
      </form>
    </div>
  );
};

export default CreateGlove;
