import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileCheck2,
  GraduationCap,
  Loader2,
  Users,
  Wallet,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { StatsSkeleton } from "../components/Loader";
import { formatMoney } from "../utils";

const ICON_MAP = {
  "Total orders": ClipboardList,
  "Awaiting payment": Clock3,
  "Paid / ready": Wallet,
  "In progress": Loader2,
  Submitted: FileCheck2,
  Completed: BadgeCheck,
  Students: Users,
  "Revenue (paid)": CircleDollarSign,
  Assigned: ClipboardList,
};

export default function DashboardPage() {
  const { token, user, isWriter } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.getStats(token);
        if (!cancelled) setStats(res.data.stats);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const cards = isWriter
    ? [
        { label: "Assigned", value: stats?.assigned },
        { label: "In progress", value: stats?.inProgress },
        { label: "Submitted", value: stats?.submitted },
        { label: "Completed", value: stats?.completed },
      ]
    : [
        { label: "Total orders", value: stats?.totalOrders },
        { label: "Awaiting payment", value: stats?.awaitingPayment },
        { label: "Paid / ready", value: stats?.paid },
        { label: "In progress", value: stats?.inProgress },
        { label: "Submitted", value: stats?.submitted },
        { label: "Completed", value: stats?.completed },
        { label: "Students", value: stats?.totalStudents },
        {
          label: "Revenue (paid)",
          value:
            stats?.revenue !== undefined
              ? formatMoney(stats.revenue)
              : undefined,
        },
      ];

  return (
    <div className="page">
      <div className="page-sticky">
        <div className="topbar">
          <div>
            <h2>
              <GraduationCap size={28} strokeWidth={2} className="title-icon" />
              Dashboard
            </h2>
            <p>
              Welcome back, {user?.fullName}. Track workload across TutorsPath and
              TutorsNext.
            </p>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <StatsSkeleton count={isWriter ? 4 : 8} />
      ) : (
        <div className="stats-grid">
          {cards.map((card) => {
            const Icon = ICON_MAP[card.label] || ClipboardList;
            return (
              <div className="stat-card" key={card.label}>
                <div className="stat-card-head">
                  <span>{card.label}</span>
                  <span className="stat-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                </div>
                <strong>{card.value ?? "—"}</strong>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
