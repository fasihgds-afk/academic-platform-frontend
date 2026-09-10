import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Info,
  Pencil,
  Save,
  UserRound,
  UserX,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ButtonLoader, PageLoader } from "../components/Loader";
import {
  formatDate,
  formatMoney,
  formatOrderId,
  statusBadgeClass,
  statusLabel,
} from "../utils";

const emptyForm = {
  fullName: "",
  email: "",
  countryCode: "",
  phoneNumber: "",
  password: "",
  tag: "tutorspath",
};

export default function StudentDetailPage() {
  const { userId } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getStudent(token, userId);
      setData(res.data);
      const student = res.data.student;
      setForm({
        fullName: student.fullName || "",
        email: student.email || "",
        countryCode: student.countryCode || "",
        phoneNumber: student.phoneNumber || "",
        password: "",
        tag: student.tag || "tutorspath",
      });
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId]);

  const onSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const body = {
        fullName: form.fullName,
        email: form.email,
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
        tag: form.tag,
      };
      if (form.password.trim()) {
        body.password = form.password.trim();
      }
      await api.updateStudent(token, userId, body);
      setMessage("Student profile updated.");
      setForm((f) => ({ ...f, password: "" }));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onToggleActive = async () => {
    if (!data?.student) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const next = !data.student.isActive;
      await api.updateStudentStatus(token, userId, next);
      setMessage(
        next
          ? "Student activated. They can sign in again."
          : "Student deactivated. Login is blocked.",
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageLoader message="Loading student…" />
      </div>
    );
  }

  if (!data?.student) {
    return (
      <div className="page">
        <div className="error-banner">{error || "Student not found"}</div>
        <Link className="btn btn-secondary btn-sm" to="/students">
          <ArrowLeft size={15} strokeWidth={2.25} />
          Back to students
        </Link>
      </div>
    );
  }

  const student = data.student;
  const orders = data.orders || [];
  const payments = data.payments || [];

  return (
    <div className="page">
      <div className="page-sticky">
        <div className="topbar">
          <div>
            <h2>
              <UserRound size={26} strokeWidth={2} className="title-icon" />
              {student.fullName}
            </h2>
            <p>
              {student.email} · {student.tag} ·{" "}
              <span
                className={`badge ${student.isActive ? "success" : "danger"}`}
              >
                {student.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
          <div className="actions-row">
            <button
              className={`btn btn-sm ${student.isActive ? "btn-secondary" : "btn-primary"}`}
              type="button"
              disabled={busy}
              onClick={onToggleActive}
            >
              <UserX size={15} strokeWidth={2.25} />
              {student.isActive ? "Deactivate" : "Activate"}
            </button>
            <Link className="btn btn-secondary btn-sm" to="/students">
              <ArrowLeft size={15} strokeWidth={2.25} />
              Back
            </Link>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      <div className="notice">
        <Info size={16} strokeWidth={2.25} className="inline-icon" />
        Stripe payment intents are used in the student app. Webhooks update
        order/payment status automatically after card or payment-link checkout.
        This page shows the resulting payment history.
      </div>

      <div className="grid-2">
        <div className="stack">
          <div className="panel detail-block animate-in">
            <h3>
              <Pencil size={18} strokeWidth={2.25} className="inline-icon" />
              Edit profile
            </h3>
            <form className="stack" onSubmit={onSave}>
              <div className="field">
                <label>Full name</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fullName: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <div className="field">
                <label>Email</label>
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
                <label>New password (optional)</label>
                <input
                  type="text"
                  minLength={8}
                  placeholder="Leave blank to keep current password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <p className="muted" style={{ margin: 0 }}>
                Current password on file: {student.password || "—"}
              </p>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? (
                  <ButtonLoader label="Saving…" />
                ) : (
                  <>
                    <Save size={15} strokeWidth={2.25} />
                    Save changes
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="panel detail-block animate-in animate-in-delay-1">
            <h3>Account</h3>
            <dl className="kv">
              <dt>Last login</dt>
              <dd>{formatDate(student.lastLoginAt)}</dd>
              <dt>Email verified</dt>
              <dd>{student.emailVerified ? "Yes" : "No"}</dd>
              <dt>Joined</dt>
              <dd>{formatDate(student.createdAt)}</dd>
            </dl>
          </div>
        </div>

        <div className="stack">
          <div className="panel detail-block animate-in">
            <h3>Orders</h3>
            {orders.length === 0 ? (
              <p className="muted">No orders yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          {formatOrderId(order)}
                          <div className="muted">{order.title}</div>
                        </td>
                        <td>
                          <span
                            className={`badge ${statusBadgeClass(order.status)}`}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </td>
                        <td>{order.paymentStatus || "—"}</td>
                        <td>
                          {formatMoney(
                            order.pricing?.finalAmount,
                            order.pricing?.currency,
                          )}
                        </td>
                        <td>
                          <Link
                            className="btn btn-secondary btn-sm"
                            to={`/orders/${order._id}`}
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="panel detail-block animate-in animate-in-delay-1">
            <h3>
              <CreditCard size={18} strokeWidth={2.25} className="inline-icon" />
              Payments (Stripe)
            </h3>
            <p className="muted" style={{ marginTop: 0 }}>
              Includes student app payment intents and admin/sales payment
              links. Status updates come from the Stripe webhook.
            </p>
            {payments.length === 0 ? (
              <p className="muted">No Stripe payments recorded yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Paid at</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          {payment.orderId?.orderNumber ||
                            payment.orderId?._id ||
                            "—"}
                        </td>
                        <td>
                          {formatMoney(payment.amount, payment.currency)}
                        </td>
                        <td>{payment.status}</td>
                        <td>{formatDate(payment.paidAt)}</td>
                        <td>
                          {payment.paymentLink?.url ? (
                            <a
                              href={payment.paymentLink.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                            </a>
                          ) : (
                            "—"
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
    </div>
  );
}
