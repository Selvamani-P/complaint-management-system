import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthMessages } from "../store/slices/authSlice";
import Icon from "../components/common/Icon";
import Button from "../components/common/Button";

export function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\+?[\d\s-]{7,15}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    dispatch(clearAuthMessages());

    if (!validate()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password
    };

    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "460px" }}>
        <div className="auth-logo">CMS</div>

        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-subtitle">
          Register for the Complaint Management System
        </p>

        {successMessage && (
          <div className="success-state" role="status" style={{ marginBottom: "16px", fontSize: "13px" }}>
            {successMessage} Redirecting to login...
          </div>
        )}

        {error && (
          <div className="error-state" role="alert" style={{ marginBottom: "16px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} noValidate>
          {/* NAME */}
          <div className="form-group">
            <label htmlFor="register-name">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              className={`form-input ${clientErrors.name ? "input-error" : ""}`}
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {clientErrors.name && (
              <span className="form-error-msg">{clientErrors.name}</span>
            )}
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="register-email">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              className={`form-input ${clientErrors.email ? "input-error" : ""}`}
              placeholder="name@organization.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              required
            />
            {clientErrors.email && (
              <span className="form-error-msg">{clientErrors.email}</span>
            )}
          </div>

          {/* PHONE */}
          <div className="form-group">
            <label htmlFor="register-phone">
              Phone Number <span className="required-star">*</span>
            </label>
            <input
              id="register-phone"
              name="phone"
              type="tel"
              className={`form-input ${clientErrors.phone ? "input-error" : ""}`}
              placeholder="e.g. +1 555-0199"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              autoComplete="tel"
              required
            />
            {clientErrors.phone && (
              <span className="form-error-msg">{clientErrors.phone}</span>
            )}
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label htmlFor="register-password">
              Password <span className="required-star">*</span>
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${clientErrors.password ? "input-error" : ""}`}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
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
            {clientErrors.password && (
              <span className="form-error-msg">{clientErrors.password}</span>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label htmlFor="register-confirm-password">
              Confirm Password <span className="required-star">*</span>
            </label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              className={`form-input ${clientErrors.confirmPassword ? "input-error" : ""}`}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
              required
            />
            {clientErrors.confirmPassword && (
              <span className="form-error-msg">{clientErrors.confirmPassword}</span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          >
            Create Account
          </Button>
        </form>

        <p className="auth-footer" style={{ marginTop: "24px", textAlign: "center", color: "var(--slate-600)", fontSize: "13.5px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: "600", color: "var(--primary-600)" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;