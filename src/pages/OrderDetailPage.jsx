import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Info,
  Pencil,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ButtonLoader, PageLoader } from "../components/Loader";
import {
  formatDate,
  formatMoney,
  nextStatusesFor,
  statusBadgeClass,
  statusLabel,
} from "../utils";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { token, user, isAdmin, isSales } = useAuth();
  const [data, setData] = useState(null);
  const [writers, setWriters] = useState([]);
  const [writerId, setWriterId] = useState("");
  const [status, setStatus] = useState("");
  const [priceMode, setPriceMode] = useState("discountPercentage");
  const [priceValue, setPriceValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const priceFormRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getOrder(token, orderId);
      setData(res.data);
      setStatus("");
      if (isAdmin) {
        const writersRes = await api.listWriters(token);
        setWriters(writersRes.data.writers || []);
      }
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
  }, [orderId, token]);

  useEffect(() => {
    if (
      !loading &&
      data?.order?.status === "awaitingPayment" &&
      searchParams.get("editPrice") === "1" &&
      priceFormRef.current
    ) {
      priceFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, data, searchParams]);

  const order = data?.order;
  const nextStatuses = order ? nextStatusesFor(user.role, order.status) : [];

  const run = async (fn, successText) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      setMessage(successText);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onAssign = () =>
    run(
      () => api.assignWriter(token, orderId, writerId),
      "Writer assigned. Deliver files by email outside this panel.",
    );

  const onStatus = () =>
    run(
      () => api.updateOrderStatus(token, orderId, status),
      "Order status updated.",
    );

  const onPrice = () => {
    const body = { discountReason: discountReason || undefined };
    const num = Number(priceValue);

    if (Number.isNaN(num)) {
      setError("Enter a valid number");
      return;
    }

    body[priceMode] = num;

    return run(() => api.updatePrice(token, orderId, body), "Price updated.");
  };

  if (loading) {
    return (
      <div className="page">
        <PageLoader message="Loading order details…" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page">
        <div className="error-banner">{error || "Order not found"}</div>
        <Link className="btn btn-secondary btn-sm" to="/orders">
          <ArrowLeft size={15} strokeWidth={2.25} />
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-sticky">
        <div className="topbar">
          <div>
            <h2>
              <ClipboardList size={26} strokeWidth={2} className="title-icon" />
              {order.orderNumber || "Order detail"}
            </h2>
            <p>
              {order.title} · {order.tag} ·{" "}
              <span className={`badge ${statusBadgeClass(order.status)}`}>
                {statusLabel(order.status)}
              </span>
            </p>
          </div>
          <Link className="btn btn-secondary btn-sm" to="/orders">
            <ArrowLeft size={15} strokeWidth={2.25} />
            Back
          </Link>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      <div className="notice">
        <Info size={16} strokeWidth={2.25} className="inline-icon" />
        File delivery is manual by email. Use this screen only for assignment
        and status updates.
      </div>

      <div className="grid-2">
        <div className="stack">
          <div className="panel detail-block animate-in">
            <h3>Assignment</h3>
            <dl className="kv">
              <dt>Type</dt>
              <dd>{order.assignmentType}</dd>
              <dt>Level</dt>
              <dd>{order.academicLevel}</dd>
              <dt>Subject</dt>
              <dd>{order.subject}</dd>
              <dt>Deadline</dt>
              <dd>{order.deadline}</dd>
              <dt>Pages</dt>
              <dd>
                {order.numberOfPages} ({order.lineSpacing})
              </dd>
              <dt>Citation</dt>
              <dd>{order.citationStyle || "—"}</dd>
              <dt>Guidelines</dt>
              <dd>{order.guidelines || "—"}</dd>
            </dl>
          </div>

          <div className="panel detail-block animate-in animate-in-delay-1">
            <h3>Student</h3>
            <dl className="kv">
              <dt>Name</dt>
              <dd>{order.studentId?.fullName}</dd>
              <dt>Email</dt>
              <dd>{order.studentId?.email}</dd>
              <dt>Phone</dt>
              <dd>
                {order.studentId?.countryCode} {order.studentId?.phoneNumber}
              </dd>
              <dt>Website</dt>
              <dd>{order.studentId?.tag || order.tag}</dd>
            </dl>
          </div>

          <div className="panel detail-block animate-in animate-in-delay-2">
            <h3>Timeline</h3>
            {(data.events || []).length === 0 ? (
              <div className="muted">No events yet.</div>
            ) : (
              <ul className="timeline">
                {data.events.map((event) => (
                  <li key={event._id}>
                    <strong>{event.action}</strong>
                    <div className="muted">
                      {event.fromStatus
                        ? `${statusLabel(event.fromStatus)} → ${statusLabel(event.toStatus)}`
                        : statusLabel(event.toStatus) || "—"}
                      {" · "}
                      {formatDate(event.createdAt)}
                      {event.userId?.fullName
                        ? ` · ${event.userId.fullName}`
                        : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="panel detail-block animate-in">
            <h3>Pricing</h3>
            <dl className="kv">
              <dt>Calculated</dt>
              <dd>
                {formatMoney(
                  order.pricing?.calculatedAmount,
                  order.pricing?.currency,
                )}
              </dd>
              <dt>Discount</dt>
              <dd>
                {formatMoney(
                  order.pricing?.discountAmount,
                  order.pricing?.currency,
                )}{" "}
                ({order.pricing?.discountPercentage || 0}%)
              </dd>
              <dt>Final</dt>
              <dd>
                <strong>
                  {formatMoney(
                    order.pricing?.finalAmount,
                    order.pricing?.currency,
                  )}
                </strong>
              </dd>
              <dt>Payment</dt>
              <dd>
                {order.paymentStatus}
                {data.payment?.status ? ` · ${data.payment.status}` : ""}
              </dd>
            </dl>

            {(isAdmin || isSales) && order.status === "awaitingPayment" && (
              <div
                className="stack"
                style={{ marginTop: 16 }}
                ref={priceFormRef}
                id="edit-price"
              >
                <h4 style={{ margin: 0, fontFamily: "var(--display)" }}>
                  <Pencil size={16} strokeWidth={2.25} className="inline-icon" />
                  Edit price / apply discount
                </h4>
                <p className="muted" style={{ margin: 0 }}>
                  Use this when a student requests a discount on call. Only
                  available while status is Awaiting Payment.
                </p>
                <div className="field">
                  <label>Price edit mode</label>
                  <select
                    value={priceMode}
                    onChange={(e) => setPriceMode(e.target.value)}
                    disabled={busy}
                  >
                    <option value="discountPercentage">Discount %</option>
                    <option value="discountAmount">Discount amount</option>
                    <option value="finalAmount">Final amount</option>
                  </select>
                </div>
                <div className="field">
                  <label>Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="field">
                  <label>Reason</label>
                  <input
                    placeholder="e.g. phone discount request"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={busy || !priceValue}
                  onClick={onPrice}
                >
                  {busy ? <ButtonLoader label="Updating…" /> : (
                    <>
                      <Pencil size={15} strokeWidth={2.25} />
                      Update price
                    </>
                  )}
                </button>
              </div>
            )}

            {(isAdmin || isSales) && order.status !== "awaitingPayment" && (
              <p className="muted" style={{ marginTop: 16 }}>
                Price can only be edited while the order is Awaiting Payment.
                Current status: {statusLabel(order.status)}.
              </p>
            )}
          </div>

          <div className="panel detail-block animate-in animate-in-delay-1">
            <h3>Writer</h3>
            <p>
              Current:{" "}
              <strong>{order.currentWriterId?.fullName || "Unassigned"}</strong>
            </p>
            {order.currentWriterId?.email && (
              <p className="muted">{order.currentWriterId.email}</p>
            )}

            {isAdmin &&
              ["paid", "writerAssigned", "inProgress", "revisionRequested"].includes(
                order.status,
              ) && (
                <div className="actions-row" style={{ marginTop: 12 }}>
                  <div className="field">
                    <label>Assign writer</label>
                    <select
                      value={writerId}
                      onChange={(e) => setWriterId(e.target.value)}
                      disabled={busy}
                    >
                      <option value="">Select writer</option>
                      {writers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.fullName} ({w.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary"
                    type="button"
                    disabled={busy || !writerId}
                    onClick={onAssign}
                  >
                    {busy ? <ButtonLoader label="Assigning…" /> : (
                      <>
                        <UserCheck size={15} strokeWidth={2.25} />
                        Assign
                      </>
                    )}
                  </button>
                </div>
              )}
          </div>

          <div className="panel detail-block animate-in animate-in-delay-2">
            <h3>Status</h3>
            {nextStatuses.length === 0 ? (
              <p className="muted">No status changes available for your role.</p>
            ) : (
              <div className="actions-row">
                <div className="field">
                  <label>Next status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={busy}
                  >
                    <option value="">Select</option>
                    {nextStatuses.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={busy || !status}
                  onClick={onStatus}
                >
                  {busy ? <ButtonLoader label="Updating…" /> : (
                    <>
                      <RefreshCw size={15} strokeWidth={2.25} />
                      Update status
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
