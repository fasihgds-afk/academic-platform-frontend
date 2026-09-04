import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, SearchX, Users } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { TableSkeleton } from "../components/Loader";
import { formatDate } from "../utils";

export default function StudentsPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    tag: "",
    page: 1,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.listStudents(token, filters);
        if (!cancelled) {
          setStudents(res.data.users || []);
          setPagination(res.data.pagination || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStudents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, filters]);

  return (
    <div className="page">
      <div className="page-sticky">
        <div className="topbar">
          <div>
            <h2>
              <Users size={26} strokeWidth={2} className="title-icon" />
              Students
            </h2>
            <p>Students registered from TutorsPath and TutorsNext.</p>
          </div>
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

      <div className="panel table-panel">
        {loading ? (
          <TableSkeleton rows={7} cols={5} />
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
                  <th>Website</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.fullName}</td>
                    <td>
                      {student.email}
                      <div className="muted">
                        {student.countryCode} {student.phoneNumber}
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
                  </tr>
                ))}
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
