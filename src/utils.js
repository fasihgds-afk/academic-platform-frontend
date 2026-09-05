export const ORDER_STATUSES = [
  "draft",
  "awaitingPayment",
  "paid",
  "detailsMissing",
  "detailsApproved",
  "writerAssigned",
  "inProgress",
  "submitted",
  "revisionRequested",
  "completed",
  "cancelled",
  "refunded",
];

export const WRITER_MANAGER_STATUSES = [
  "paid",
  "detailsMissing",
  "detailsApproved",
  "writerAssigned",
  "inProgress",
  "submitted",
  "revisionRequested",
  "completed",
  "cancelled",
  "refunded",
];

export function formatMoney(amount, currency = "usd") {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function formatDateShort(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatOrderId(order) {
  // Always show the student-facing backend orderNumber (e.g. TP-F1735008)
  if (order?.orderNumber) return order.orderNumber;
  return "—";
}

export function statusLabel(status) {
  if (!status) return "—";
  return status
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());
}

export function statusBadgeClass(status) {
  const map = {
    awaitingPayment: "warn",
    paid: "info",
    detailsMissing: "warn",
    detailsApproved: "success",
    writerAssigned: "info",
    inProgress: "info",
    submitted: "success",
    completed: "success",
    revisionRequested: "warn",
    cancelled: "danger",
    refunded: "danger",
    draft: "",
  };
  return map[status] || "";
}

export function roleLabel(role) {
  const map = {
    admin: "Admin",
    salesAgent: "Sales Agent",
    writer: "Writer",
    writerManager: "Writer Manager",
    student: "Student",
  };
  return map[role] || role;
}

/** Status actions available in the UI by role (matches planned backend rules) */
export function nextStatusesFor(role, currentStatus) {
  const map = {
    admin: {
      paid: ["detailsMissing", "detailsApproved", "cancelled"],
      detailsMissing: ["detailsApproved", "cancelled"],
      detailsApproved: ["detailsMissing", "cancelled"],
      writerAssigned: ["inProgress", "cancelled"],
      inProgress: ["submitted", "cancelled"],
      submitted: ["revisionRequested", "completed", "cancelled"],
      revisionRequested: ["inProgress", "cancelled"],
      completed: ["refunded"],
      awaitingPayment: ["cancelled"],
      draft: ["cancelled"],
    },
    salesAgent: {
      submitted: ["revisionRequested", "completed"],
      revisionRequested: ["inProgress"],
    },
    writer: {
      writerAssigned: ["inProgress"],
      inProgress: ["submitted"],
      revisionRequested: ["inProgress"],
    },
    writerManager: {
      paid: ["detailsMissing", "detailsApproved"],
      detailsMissing: ["detailsApproved"],
      detailsApproved: ["detailsMissing"],
    },
  };

  return map[role]?.[currentStatus] || [];
}
