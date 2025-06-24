import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import Alert from "../components/Alert";
import RmtsLogo from "../../src/assets/RMTS.jpeg";

import "../CSS/login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Optional state for error/success messages:
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    setVisible((prev) => !prev);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Login successful.");
        console.log("Login successful:", data);
        navigate("/appointments");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Login failed.");
      }
    } catch (error: any) {
      setError(error.message || "Error connecting to the server.");
    }
  };

  return (
    <body>
      <div className="page">
        <div className="containerrr">
          <div className="left">
            <div className="image_title">RMTS</div>
            <img src="../../public/login.png" />
          </div>
          <div className="right">
            <div className="title">Login</div>
            <div className="subtitle">Access to Dashboard</div>
            <div className="form-container1">
              <div className="form-content">
                {/* Display Alerts */}
                {error && <Alert type="error" message={error} />}
                {message && <Alert type="success" message={message} />}

                <form onSubmit={handleSubmit}>
                  <div className="input-container">
                    <label htmlFor="email">Email address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="password">Password</label>
                    <div className="input_password">
                      <input
                        type={visible ? "text" : "password"}
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <img
                        src={visible ? "eye.png" : "eye-blocked.png"}
                        alt={visible ? "Hide password" : "Show password"}
                        onClick={toggleVisibility}
                        style={{
                          cursor: "pointer",
                          marginLeft: "10px",
                          width: "24px",
                          height: "24px",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <button type="submit" className="submit-btn">
                      Login
                    </button>
                  </div>
                </form>

                <div className="link-container">
                  <Link to="/reset-password" className="link">
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  );
};

export default Login;
