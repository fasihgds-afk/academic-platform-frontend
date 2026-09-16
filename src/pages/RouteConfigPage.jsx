import { useMemo, useState } from "react";
import { Plus, Route, Search, SearchX, Trash2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ButtonLoader, TableSkeleton } from "../components/Loader";
import { formatDate, formatDateShort } from "../utils";

const SITE_TAGS = [
  { value: "tutorspath", label: "TutorsPath" },
  { value: "tutorsnext", label: "TutorsNext" },
  { value: "tutorspie", label: "TutorsPie" },
];

const HOMEPAGE_FILTERS = [
  { value: "all", label: "All" },
  { value: "real", label: "Real" },
  { value: "demo", label: "Demo" },
];

const emptyForm = {
  path: "",
  isRealHomePage: true,
};

function normalizePath(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "");
}

function routeFamily(path) {
  const segment = normalizePath(path).split("/")[0];
  const match = segment.match(/^([a-z]+)/);
  return match ? match[1] : "";
}

function routeNumber(path) {
  const segment = normalizePath(path).split("/")[0];
  const match = segment.match(/(\d+)(?!.*\d)/);
  return match ? Number(match[1]) : 0;
}

function compareRoutes(a, b) {
  const familyA = routeFamily(a.path);
  const familyB = routeFamily(b.path);
  if (familyA !== familyB) return familyA.localeCompare(familyB);

  const numberA = routeNumber(a.path);
  const numberB = routeNumber(b.path);
  if (numberA !== numberB) return numberA - numberB;

  return normalizePath(a.path).localeCompare(normalizePath(b.path));
}

function pathMatchesQuery(path, query) {
  const needle = normalizePath(query);
  if (!needle) return true;

  const pathBare = normalizePath(path);
  const queryFamily = (needle.match(/^([a-z]+)/) || [])[1] || "";

  // "/essay" or "homework" shows every route in that family.
  if (queryFamily && /^[a-z]+-?$/.test(needle)) {
    return routeFamily(path) === queryFamily;
  }

  if (pathBare === needle) return true;
  if (!pathBare.startsWith(needle)) return false;

  const next = pathBare.charAt(needle.length);
  if (!next || next === "-" || next === "/") return true;
  if (/\d$/.test(needle) && /\d/.test(next)) return false;
  return true;
}

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
  const [pathQuery, setPathQuery] = useState("");
  const [homepageFilter, setHomepageFilter] = useState("all");

  const filtersActive = pathQuery.trim() !== "" || homepageFilter !== "all";

  const visibleRoutes = useMemo(() => {
    return routes
      .filter((route) => {
        if (!pathMatchesQuery(route.path, pathQuery)) return false;
        if (homepageFilter === "real") return Boolean(route.isRealHomePage);
        if (homepageFilter === "demo") return !route.isRealHomePage;
        return true;
      })
      .sort(compareRoutes);
  }, [routes, pathQuery, homepageFilter]);

  const clearFilters = () => {
    setPathQuery("");
    setHomepageFilter("all");
  };

  const load = async (tag = siteTag) => {
    const normalized = tag.trim();
    if (!normalized) {
      setError("Site tag is required");
      return;
    }

    if (normalized !== loadedTag) {
      setPathQuery("");
      setHomepageFilter("all");
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
    <div className="page route-config-page">
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

        <form className="panel toolbar route-toolbar" onSubmit={onLoad}>
          <div className="field">
            <label htmlFor="route-site-tag">Site tag</label>
            <select
              id="route-site-tag"
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
          <div className="field field-load">
            <label htmlFor="route-load-btn">&nbsp;</label>
            <button
              id="route-load-btn"
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

      <div className="route-config-layout">
        <div className="panel route-save-panel animate-in">
          <h3>
            <Plus size={18} strokeWidth={2.25} className="inline-icon" />
            Save route
          </h3>
          <form className="stack" onSubmit={onSave}>
            <div className="field">
              <label htmlFor="route-path-input">Path</label>
              <input
                id="route-path-input"
                required
                placeholder="/essay"
                value={form.path}
                onChange={(e) =>
                  setForm((f) => ({ ...f, path: e.target.value }))
                }
                disabled={busy}
              />
            </div>
            <label className="field field-check">
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

        <div className="panel route-list-panel animate-in animate-in-delay-1">
          <div className="route-list-head">
            <div className="route-list-title">
              <h3>
                <Search size={18} strokeWidth={2.25} className="inline-icon" />
                Configured paths
                {loadedTag ? ` · ${loadedTag}` : ""}
              </h3>
              {hasLoaded && routes.length > 0 && (
                <div className="route-list-meta">
                  <span className="route-list-count">
                    {filtersActive
                      ? `${visibleRoutes.length} of ${routes.length}`
                      : `${routes.length} path${routes.length === 1 ? "" : "s"}`}
                  </span>
                  {filtersActive && (
                    <button
                      className="btn btn-sm btn-secondary"
                      type="button"
                      onClick={clearFilters}
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {hasLoaded && routes.length > 0 && (
              <div className="route-filters">
                <div className="field field-search">
                  <label htmlFor="route-path-search">Path</label>
                  <div className="input-with-icon">
                    <Search
                      className="field-icon"
                      size={17}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <input
                      id="route-path-search"
                      placeholder="essay, homework, paper…"
                      value={pathQuery}
                      onChange={(e) => setPathQuery(e.target.value)}
                      disabled={busy}
                    />
                  </div>
                </div>
                <div className="field field-homepage">
                  <label>Homepage</label>
                  <div
                    className="segmented"
                    role="group"
                    aria-label="Homepage type"
                  >
                    {HOMEPAGE_FILTERS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={homepageFilter === option.value}
                        disabled={busy}
                        onClick={() => setHomepageFilter(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="route-list-body">
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
            ) : visibleRoutes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon" aria-hidden="true">
                  <SearchX size={22} strokeWidth={2} />
                </div>
                No paths match these filters.
                <div className="empty-state-action">
                  <button
                    className="btn btn-sm btn-secondary"
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="route-table">
                  <colgroup>
                    <col className="col-path" />
                    <col className="col-home" />
                    <col className="col-updated" />
                    <col className="col-actions" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Path</th>
                      <th>Homepage</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRoutes.map((route) => (
                      <tr key={route.path}>
                        <td data-label="Path" className="cell-path">
                          {route.path}
                        </td>
                        <td data-label="Homepage">
                          <span
                            className={`badge ${route.isRealHomePage ? "success" : "warn"}`}
                          >
                            {route.isRealHomePage ? "Real" : "Demo"}
                          </span>
                        </td>
                        <td data-label="Updated" className="cell-updated">
                          <span className="date-full">
                            {formatDate(route.updatedAt)}
                          </span>
                          <span className="date-short">
                            {formatDateShort(route.updatedAt)}
                          </span>
                        </td>
                        <td className="cell-actions">
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
    </div>
  );
}
