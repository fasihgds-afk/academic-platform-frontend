import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ButtonLoader, FullScreenLoader } from "../components/Loader";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return <FullScreenLoader message="Checking session…" />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-logo" aria-hidden="true">
            <GraduationCap size={22} strokeWidth={2.25} />
          </div>
          <div>
            <h1>Academic Admin</h1>
            <p className="muted" style={{ margin: 0 }}>
              Panel sign in
            </p>
          </div>
        </div>

        <p>Sign in with your admin, sales, writer, or writer manager account.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <Mail className="field-icon" size={17} strokeWidth={2} aria-hidden="true" />
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock className="field-icon" size={17} strokeWidth={2} aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                className="has-trailing-icon"
              />
              <button
                type="button"
                className="icon-btn password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} />
                ) : (
                  <Eye size={18} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? <ButtonLoader label="Signing in…" /> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
