import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Pencil,
  Search,
  SearchX,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { TableSkeleton } from "../components/Loader";
import {
  ORDER_STATUSES,
  formatDateShort,
  formatMoney,
  formatOrderId,
  statusBadgeClass,
  statusLabel,
} from "../utils";

export default function OrdersPage() {
  const { token, isWriter, isAdmin, isSales } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    tag: "",
    page: 1,
  });
  const canEditPrice = isAdmin || isSales;

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => {
        if (f.search === searchInput.trim()) return f;
        return { ...f, search: searchInput.trim(), page: 1 };
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.listOrders(token, filters);
        if (!cancelled) {
          setOrders(res.data.orders || []);
          setPagination(res.data.pagination || null);
        }
      } catch (err) {
        if (!cancelled) {
          setOrders([]);
          setError(err.message);
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
              <ClipboardList size={26} strokeWidth={2} className="title-icon" />
              {isWriter ? "My Orders" : "Orders"}
            </h2>
            <p>
              {isWriter
                ? "Orders assigned to you. Update status here; deliver files by email."
                : "All assignment orders across websites. Assign writers and update status."}
            </p>
          </div>
        </div>

        {!isWriter && (
          <div className="panel toolbar">
            <div className="field field-search">
              <label>Search</label>
              <div className="input-with-icon">
                <Search
                  className="field-icon"
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <input
                  placeholder="Order ID, student, writer, title, subject…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <div className="field field-filter">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))
                }
              >
                <option value="">All</option>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field field-filter">
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
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel table-panel">
        {loading ? (
          <TableSkeleton rows={7} cols={5} />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              <SearchX size={22} strokeWidth={2} />
            </div>
            No orders found. Try adjusting your filters.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table orders-table">
              <colgroup>
                <col className="col-order" />
                <col className="col-student" />
                <col className="col-title" />
                <col className="col-status" />
                <col className="col-amount" />
                <col className="col-writer" />
                <col className="col-date" />
                <col className="col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Student</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Writer</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const orderId = formatOrderId(order);
                  const title = order.title || "—";

                  return (
                    <tr key={order._id}>
                      <td className="cell-order">
                        <Link
                          className="table-link order-id"
                          to={`/orders/${order._id}`}
                          title={orderId}
                        >
                          {orderId}
                        </Link>
                        <div className="muted cell-sub">{order.tag || "—"}</div>
                      </td>
                      <td className="cell-student">
                        <div className="cell-primary" title={order.studentId?.fullName || ""}>
                          {order.studentId?.fullName || "—"}
                        </div>
                        <div
                          className="muted cell-sub"
                          title={order.studentId?.email || ""}
                        >
                          {order.studentId?.email || "—"}
                        </div>
                      </td>
                      <td className="cell-title">
                        <div className="cell-primary" title={title}>
                          {title}
                        </div>
                        <div className="muted cell-sub" title={order.subject || ""}>
                          {order.subject || "—"}
                        </div>
                      </td>
                      <td className="cell-status">
                        <span className={`badge ${statusBadgeClass(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="cell-amount">
                        {formatMoney(
                          order.pricing?.finalAmount,
                          order.pricing?.currency,
                        )}
                      </td>
                      <td className="cell-writer">
                        <div
                          className="cell-primary"
                          title={order.currentWriterId?.fullName || "Unassigned"}
                        >
                          {order.currentWriterId?.fullName || "Unassigned"}
                        </div>
                      </td>
                      <td className="cell-date" title={order.createdAt || ""}>
                        {formatDateShort(order.createdAt)}
                      </td>
                      <td className="cell-actions">
                        <div className="actions-inline">
                          <Link
                            className="btn btn-secondary btn-sm"
                            to={`/orders/${order._id}`}
                            title="Open order"
                          >
                            <ExternalLink size={14} strokeWidth={2.25} />
                            Open
                          </Link>
                          {canEditPrice && order.status === "awaitingPayment" && (
                            <Link
                              className="btn btn-primary btn-sm"
                              to={`/orders/${order._id}?editPrice=1`}
                              title="Edit price"
                            >
                              <Pencil size={14} strokeWidth={2.25} />
                              Price
                            </Link>
                          )}
                        </div>
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
