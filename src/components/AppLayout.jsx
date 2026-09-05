import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  UserCog,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { roleLabel } from "../utils";

export default function AppLayout() {
  const { user, logout, isAdmin, isSales, isWriter } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            <GraduationCap size={22} strokeWidth={2.25} />
          </div>
          <div>
            <h1>Academic Admin</h1>
            <p>Operations panel</p>
          </div>
          <button
            className="mobile-toggle"
            type="button"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className={`nav ${navOpen ? "open" : ""}`}>
          <NavLink to="/" end onClick={closeNav}>
            <LayoutDashboard className="nav-icon" size={18} strokeWidth={2} />
            Dashboard
          </NavLink>
          <NavLink to="/orders" onClick={closeNav}>
            <ClipboardList className="nav-icon" size={18} strokeWidth={2} />
            {isWriter ? "My Orders" : "Orders"}
          </NavLink>
          {(isAdmin || isSales) && (
            <NavLink to="/students" onClick={closeNav}>
              <Users className="nav-icon" size={18} strokeWidth={2} />
              Students
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/staff" onClick={closeNav}>
              <UserCog className="nav-icon" size={18} strokeWidth={2} />
              Staff
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <strong>{user?.fullName}</strong>
          <span>
            {roleLabel(user?.role)} · {user?.email}
          </span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={logout}>
            <LogOut size={15} strokeWidth={2.25} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
