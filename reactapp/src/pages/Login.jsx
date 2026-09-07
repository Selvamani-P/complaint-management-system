import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthMessages } from "../store/slices/authSlice";
import Icon from "../components/common/Icon";
import Button from "../components/common/Button";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get("sessionExpired") === "true";

  const handleLogin = async (e) => {
    e.preventDefault();
    setClientError("");
    dispatch(clearAuthMessages());

    if (!email.trim()) {
      setClientError("Please enter your email address.");
      return;
    }
    if (!password) {
      setClientError("Please enter your password.");
      return;
    }

    const result = await dispatch(loginUser({ email: email.trim(), password }));
    if (loginUser.fulfilled.match(result)) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  };

  const displayError = clientError || error;

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* LOGO */}
        <div className="auth-logo">
          CMS
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">
          Sign in to the Complaint Management System
        </p>

        {sessionExpired && !displayError && (
          <div className="error-state" style={{ marginBottom: "16px", fontSize: "13px" }}>
            Your session has expired. Please sign in again.
          </div>
        )}

        {displayError && (
          <div className="error-state" role="alert" style={{ marginBottom: "16px", fontSize: "13px" }}>
            {displayError}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="login-email">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (clientError) setClientError("");
              }}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label htmlFor="login-password" style={{ margin: 0 }}>
                Password <span className="required-star">*</span>
              </label>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (clientError) setClientError("");
                }}
                disabled={loading}
                autoComplete="current-password"
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  background: "none",
                  border: "none",
                  color: "var(--slate-400)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          >
            Sign In
          </Button>
        </form>

        {/* FOOTER */}
        <p className="auth-footer" style={{ marginTop: "24px", textAlign: "center", color: "var(--slate-600)", fontSize: "13.5px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: "600", color: "var(--primary-600)" }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;