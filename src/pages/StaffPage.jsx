import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  UserPlus,
  UserCog,
  UserRound,
  UsersRound,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ButtonLoader, TableSkeleton } from "../components/Loader";
import { formatDate, roleLabel } from "../utils";

const emptyForm = {
  fullName: "",
  email: "",
  countryCode: "+1",
  phoneNumber: "",
  password: "",
  role: "writer",
};

export default function StaffPage() {
  const { token } = useAuth();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.listStaff(token);
      setStaff(res.data.users || []);
    } catch (err) {
      setError(err.message);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.createStaff(token, form);
      setForm(emptyForm);
      setShowPassword(false);
      setMessage("Staff member created. They can sign in on this panel.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (user) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.updateStaffStatus(token, user.id, !user.isActive);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (user, role) => {
    if (role === user.role) return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.updateStaffRole(token, user.id, role);
      setMessage(
        `Role updated to ${roleLabel(role)}. They should sign in again for the new permissions.`,
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="page-sticky">
        <div className="topbar">
          <div>
            <h2>
              <UserCog size={26} strokeWidth={2} className="title-icon" />
              Staff
            </h2>
            <p>
              Create writers, sales agents, and writer managers. Only admin can
              manage staff.
            </p>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      <div className="grid-2">
        <div className="panel animate-in">
          <h3 style={{ marginTop: 0, fontFamily: "var(--display)" }}>
            <UserPlus size={18} strokeWidth={2.25} className="inline-icon" />
            Create staff
          </h3>
          <form className="stack" onSubmit={onCreate}>
            <div className="field">
              <label>Full name</label>
              <div className="input-with-icon">
                <UserRound className="field-icon" size={17} strokeWidth={2} aria-hidden="true" />
                <input
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fullName: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <div className="input-with-icon">
                <Mail className="field-icon" size={17} strokeWidth={2} aria-hidden="true" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
            </div>
            <div className="actions-row">
              <div className="field">
                <label>Country code</label>
                <input
                  required
                  value={form.countryCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, countryCode: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <div className="field">
                <label>Phone</label>
                <div className="input-with-icon">
                  <Phone className="field-icon" size={17} strokeWidth={2} aria-hidden="true" />
                  <input
                    required
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phoneNumber: e.target.value }))
                    }
                    disabled={busy}
                  />
                </div>
              </div>
            </div>
            <div className="field">
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                disabled={busy}
              >
                <option value="writer">Writer</option>
                <option value="salesAgent">Sales Agent</option>
                <option value="writerManager">Writer Manager</option>
              </select>
            </div>
            <div className="field">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock className="field-icon" size={17} strokeWidth={2} aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  disabled={busy}
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
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? (
                <ButtonLoader label="Creating…" />
              ) : (
                <>
                  <UserPlus size={16} strokeWidth={2.25} />
                  Create staff
                </>
              )}
            </button>
          </form>
        </div>

        <div className="panel animate-in animate-in-delay-1">
          <h3 style={{ marginTop: 0, fontFamily: "var(--display)" }}>
            <UsersRound size={18} strokeWidth={2.25} className="inline-icon" />
            Team members
          </h3>
          {loading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : staff.length === 0 ? (
            <div className="empty-state">No staff yet.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {staff.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.fullName}
                        <div className="muted">{user.email}</div>
                      </td>
                      <td>
                        {user.role === "admin" ? (
                          roleLabel(user.role)
                        ) : (
                          <select
                            className="table-select"
                            aria-label={`Change role for ${user.fullName}`}
                            value={user.role}
                            disabled={busy}
                            onChange={(e) => changeRole(user, e.target.value)}
                          >
                            <option value="writer">Writer</option>
                            <option value="salesAgent">Sales Agent</option>
                            <option value="writerManager">Writer Manager</option>
                          </select>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${user.isActive ? "success" : "danger"}`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        {user.role !== "admin" && (
                          <button
                            className={`btn btn-sm ${user.isActive ? "btn-danger" : "btn-secondary"}`}
                            type="button"
                            disabled={busy}
                            onClick={() => toggleActive(user)}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
