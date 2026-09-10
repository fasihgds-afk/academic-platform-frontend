import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Mail,
  Phone,
  SearchX,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ButtonLoader, TableSkeleton } from "../components/Loader";
import { formatDate } from "../utils";

const emptyForm = {
  fullName: "",
  email: "",
  countryCode: "+1",
  phoneNumber: "",
  password: "",
  tag: "tutorspath",
};

export default function StudentsPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState(() => new Set());
  const [filters, setFilters] = useState({
    search: "",
    tag: "",
    page: 1,
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.listStudents(token, filters);
      setStudents(res.data.users || []);
      setPagination(res.data.pagination || null);
      setVisiblePasswords(new Set());
    } catch (err) {
      setError(err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters]);

  const togglePassword = (studentId) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.createStudent(token, form);
      setForm(emptyForm);
      setShowCreate(false);
      setMessage("Student created. They can sign in on the student site.");
      setFilters((f) => ({ ...f, page: 1 }));
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
              <Users size={26} strokeWidth={2} className="title-icon" />
              Students
            </h2>
            <p>
              Create students for phone leads, or open a profile to edit,
              deactivate, and view payments.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => setShowCreate((v) => !v)}
          >
            <UserPlus size={15} strokeWidth={2.25} />
            {showCreate ? "Hide form" : "Create student"}
          </button>
        </div>

        <div className="panel toolbar">
          <div className="field">
            <label>Search</label>
            <input
              placeholder="Name, email, phone"
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
              }
            />
          </div>
          <div className="field">
            <label>Website</label>
            <select
              value={filters.tag}
              onChange={(e) =>
                setFilters((f) => ({ ...f, tag: e.target.value, page: 1 }))
              }
            >
              <option value="">All</option>
              <option value="tutorspath">TutorsPath</option>
              <option value="tutorsnext">TutorsNext</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      {showCreate && (
        <div className="panel animate-in" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, fontFamily: "var(--display)" }}>
            <UserPlus size={18} strokeWidth={2.25} className="inline-icon" />
            Create student
          </h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Available to admin and sales agents. Use this for walk-ins or phone
            leads who cannot sign up themselves.
          </p>
          <form className="stack" onSubmit={onCreate}>
            <div className="actions-row">
              <div className="field">
                <label>Full name</label>
                <div className="input-with-icon">
                  <UserRound
                    className="field-icon"
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
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
                  <Mail
                    className="field-icon"
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
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
                  <Phone
                    className="field-icon"
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
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
            <div className="actions-row">
              <div className="field">
                <label>Website</label>
                <select
                  value={form.tag}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tag: e.target.value }))
                  }
                  disabled={busy}
                >
                  <option value="tutorspath">TutorsPath</option>
                  <option value="tutorsnext">TutorsNext</option>
                </select>
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? (
                <ButtonLoader label="Creating…" />
              ) : (
                <>
                  <UserPlus size={15} strokeWidth={2.25} />
                  Create student
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="panel table-panel">
        {loading ? (
          <TableSkeleton rows={7} cols={7} />
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              <SearchX size={22} strokeWidth={2} />
            </div>
            No students found.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Password</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const isVisible = visiblePasswords.has(student.id);
                  const password = student.password || "";

                  return (
                    <tr key={student.id}>
                      <td>{student.fullName}</td>
                      <td>
                        {student.email}
                        <div className="muted">
                          {student.countryCode} {student.phoneNumber}
                        </div>
                      </td>
                      <td>
                        <div className="password-cell">
                          <span className="password-value">
                            {password
                              ? isVisible
                                ? password
                                : "••••••••"
                              : "—"}
                          </span>
                          {password ? (
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => togglePassword(student.id)}
                              aria-label={
                                isVisible ? "Hide password" : "Show password"
                              }
                            >
                              {isVisible ? (
                                <EyeOff size={16} strokeWidth={2} />
                              ) : (
                                <Eye size={16} strokeWidth={2} />
                              )}
                            </button>
                          ) : null}
                        </div>
                      </td>
                      <td>{student.tag}</td>
                      <td>
                        <span
                          className={`badge ${student.isActive ? "success" : "danger"}`}
                        >
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{formatDate(student.createdAt)}</td>
                      <td>
                        <Link
                          className="btn btn-secondary btn-sm"
                          to={`/students/${student.id}`}
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="pager">
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              disabled={filters.page <= 1 || loading}
              onClick={() =>
                setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
              }
            >
              <ChevronLeft size={16} strokeWidth={2.25} />
              Previous
            </button>
            <span className="muted">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              disabled={filters.page >= pagination.pages || loading}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next
              <ChevronRight size={16} strokeWidth={2.25} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
