import { useState } from "react";
import { Plus, Route, Search, Trash2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ButtonLoader, TableSkeleton } from "../components/Loader";
import { formatDate } from "../utils";

const SITE_TAGS = [
  { value: "tutorspath", label: "TutorsPath" },
  { value: "tutorsnext", label: "TutorsNext" },
  { value: "tutorspie", label: "TutorsPie" },
];

const emptyForm = {
  path: "",
  isRealHomePage: true,
};

export default function RouteConfigPage() {
  const { token } = useAuth();
  const [siteTag, setSiteTag] = useState("tutorspath");
  const [loadedTag, setLoadedTag] = useState("");
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = async (tag = siteTag) => {
    const normalized = tag.trim();
    if (!normalized) {
      setError("Site tag is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.listRouteConfigs(token, normalized);
      setRoutes(res.data.routes || []);
      setLoadedTag(normalized);
      setHasLoaded(true);
    } catch (err) {
      setError(err.message);
      setRoutes([]);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const onLoad = (e) => {
    e.preventDefault();
    setMessage("");
    load();
  };

  const onSave = async (e) => {
    e.preventDefault();
    const tag = siteTag.trim();
    if (!tag) {
      setError("Site tag is required");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.upsertRouteConfig(token, {
        siteTag: tag,
        path: form.path.trim(),
        isRealHomePage: form.isRealHomePage,
      });
      setForm(emptyForm);
      setMessage("Route configuration saved.");
      await load(tag);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleReal = async (route) => {
    const tag = loadedTag || siteTag.trim();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.upsertRouteConfig(token, {
        siteTag: tag,
        path: route.path,
        isRealHomePage: !route.isRealHomePage,
      });
      setMessage(
        route.isRealHomePage
          ? `${route.path} will now show the demo homepage.`
          : `${route.path} will now show the real homepage.`,
      );
      await load(tag);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (route) => {
    const confirmed = window.confirm(
      `Delete ${route.path} for ${loadedTag}? Public sites will treat it as demo.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.deleteRouteConfig(token, loadedTag, route.path);
      setMessage(`${route.path} deleted.`);
      await load(loadedTag);
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
              <Route size={26} strokeWidth={2} className="title-icon" />
              Route configs
            </h2>
            <p>
              Control which public paths show the real homepage. Everything else
              stays on demo.
            </p>
          </div>
        </div>

        <form className="panel toolbar" onSubmit={onLoad}>
          <div className="field">
            <label>Site tag</label>
            <select
              required
              value={siteTag}
              onChange={(e) => setSiteTag(e.target.value)}
              disabled={busy || loading}
            >
              {SITE_TAGS.map((site) => (
                <option key={site.value} value={site.value}>
                  {site.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <label>&nbsp;</label>
            <button
              className="btn btn-secondary"
              type="submit"
              disabled={loading || busy}
            >
              {loading ? <ButtonLoader label="Loading…" /> : "Load routes"}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      <div className="grid-2">
        <div className="panel animate-in">
          <h3 style={{ marginTop: 0, fontFamily: "var(--display)" }}>
            <Plus size={18} strokeWidth={2.25} className="inline-icon" />
            Save route
          </h3>
          <form className="stack" onSubmit={onSave}>
            <div className="field">
              <label>Path</label>
              <input
                required
                placeholder="/essay"
                value={form.path}
                onChange={(e) =>
                  setForm((f) => ({ ...f, path: e.target.value }))
                }
                disabled={busy}
              />
            </div>
            <label
              className="field"
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <input
                type="checkbox"
                checked={form.isRealHomePage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isRealHomePage: e.target.checked }))
                }
                disabled={busy}
              />
              Real homepage
            </label>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? (
                <ButtonLoader label="Saving…" />
              ) : (
                <>
                  <Plus size={16} strokeWidth={2.25} />
                  Save route
                </>
              )}
            </button>
          </form>
        </div>

        <div className="panel animate-in animate-in-delay-1">
          <h3 style={{ marginTop: 0, fontFamily: "var(--display)" }}>
            <Search size={18} strokeWidth={2.25} className="inline-icon" />
            Configured paths
            {loadedTag ? ` · ${loadedTag}` : ""}
          </h3>
          {loading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : !hasLoaded ? (
            <div className="empty-state">
              Select a site and load routes.
            </div>
          ) : routes.length === 0 ? (
            <div className="empty-state">
              No route configs for {loadedTag || siteTag}.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Homepage</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr key={route.path}>
                      <td>{route.path}</td>
                      <td>
                        <span
                          className={`badge ${route.isRealHomePage ? "success" : "warn"}`}
                        >
                          {route.isRealHomePage ? "Real" : "Demo"}
                        </span>
                      </td>
                      <td>{formatDate(route.updatedAt)}</td>
                      <td>
                        <div className="actions-row">
                          <button
                            className="btn btn-sm btn-secondary"
                            type="button"
                            disabled={busy}
                            onClick={() => toggleReal(route)}
                          >
                            {route.isRealHomePage ? "Set demo" : "Set real"}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            type="button"
                            disabled={busy}
                            onClick={() => onDelete(route)}
                          >
                            <Trash2 size={14} strokeWidth={2.25} />
                            Delete
                          </button>
                        </div>
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
