import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ButtonLoader } from "../components/Loader";
import { formatMoney } from "../utils";

const DEADLINES = [
  "15 days",
  "10 days",
  "7 days",
  "5 days",
  "4 days",
  "3 days",
  "2 days",
  "24 hours",
  "12 hours",
  "6 hours",
  "3 hours",
];

const ADD_ONS = [
  "Grammar Check Report",
  "One Page Summary",
  "Abstract Page",
  "Quality Double-check",
];

const WEBSITE_LABELS = {
  tutorspath: "TutorsPath",
  tutorsnext: "TutorsNext",
  tutorspie: "TutorsPie",
};

const emptyForm = {
  tag: "tutorspath",
  deadline: "7 days",
  lineSpacing: "double",
  numberOfPages: 1,
  addOns: [],
};

export default function PriceCalculatorPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [pricing, setPricing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleAddOn = (name) => {
    setForm((prev) => {
      const has = prev.addOns.includes(name);
      return {
        ...prev,
        addOns: has
          ? prev.addOns.filter((item) => item !== name)
          : [...prev.addOns, name],
      };
    });
  };

  const onCalculate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api.calculatePrice(token, {
        tag: form.tag,
        deadline: form.deadline,
        lineSpacing: form.lineSpacing,
        numberOfPages: Number(form.numberOfPages),
        addOns: form.addOns,
      });
      setPricing(res.data.pricing || null);
    } catch (err) {
      setPricing(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onReset = () => {
    setForm(emptyForm);
    setPricing(null);
    setError("");
  };

  return (
    <div className="page">
      <div className="page-sticky">
        <div className="topbar">
          <div>
            <h2>
              <Calculator size={26} strokeWidth={2} className="title-icon" />
              Price calculator
            </h2>
            <p>
              Estimate order price by website, deadline, pages, spacing, and
              add-ons.
            </p>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="calc-layout">
        <div className="panel calc-form-panel">
          <div className="calc-panel-head">
            <h3>Order options</h3>
            <p>Fill in the details, then calculate.</p>
          </div>

          <form className="stack" onSubmit={onCalculate}>
            <div className="calc-fields-grid">
              <div className="field">
                <label htmlFor="calc-tag">Website</label>
                <select
                  id="calc-tag"
                  value={form.tag}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tag: e.target.value }))
                  }
                >
                  <option value="tutorspath">TutorsPath</option>
                  <option value="tutorsnext">TutorsNext</option>
                  <option value="tutorspie">TutorsPie</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="calc-deadline">Deadline</label>
                <select
                  id="calc-deadline"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                >
                  {DEADLINES.map((deadline) => (
                    <option key={deadline} value={deadline}>
                      {deadline}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="calc-spacing">Line spacing</label>
                <select
                  id="calc-spacing"
                  value={form.lineSpacing}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lineSpacing: e.target.value }))
                  }
                >
                  <option value="double">Double</option>
                  <option value="single">Single (×2)</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="calc-pages">Number of pages</label>
                <input
                  id="calc-pages"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={form.numberOfPages}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, numberOfPages: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="field">
              <label>Add-ons (optional)</label>
              <div className="addon-list" role="group" aria-label="Add-ons">
                {ADD_ONS.map((name) => {
                  const checked = form.addOns.includes(name);
                  return (
                    <label
                      key={name}
                      className={`addon-option${checked ? " is-checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAddOn(name)}
                      />
                      <span className="addon-option-text">{name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="actions-inline calc-actions">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={busy}
              >
                {busy ? (
                  <ButtonLoader label="Calculating…" />
                ) : (
                  <>
                    <Calculator size={15} strokeWidth={2.25} />
                    Calculate
                  </>
                )}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={onReset}
                disabled={busy}
              >
                <RotateCcw size={15} strokeWidth={2.25} />
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="panel calc-result-panel">
          <div className="calc-panel-head">
            <h3>Price result</h3>
            <p>Breakdown for the selected options.</p>
          </div>

          {!pricing ? (
            <div className="calc-empty">
              <div className="calc-empty-icon" aria-hidden="true">
                <Calculator size={22} strokeWidth={2} />
              </div>
              <strong>No quote yet</strong>
              <p>Choose options and click Calculate to see the final price.</p>
            </div>
          ) : (
            <div className="calc-result animate-in">
              <div className="calc-total">
                <span>Final amount</span>
                <strong>
                  {formatMoney(pricing.finalAmount, pricing.currency)}
                </strong>
                <em>
                  {WEBSITE_LABELS[pricing.tag] || pricing.tag} ·{" "}
                  {pricing.currency?.toUpperCase()}
                </em>
              </div>

              <div className="calc-breakdown">
                <div className="calc-row">
                  <span>Rate / page</span>
                  <strong>
                    {formatMoney(pricing.rate, pricing.currency)}
                  </strong>
                </div>
                <div className="calc-row">
                  <span>Pages × spacing</span>
                  <strong>
                    {pricing.numberOfPages} × {pricing.lineSpacingMultiplier}
                  </strong>
                </div>
                <div className="calc-row">
                  <span>Assignment</span>
                  <strong>
                    {formatMoney(pricing.assignmentAmount, pricing.currency)}
                  </strong>
                </div>
                <div className="calc-row">
                  <span>Add-ons</span>
                  <strong>
                    {formatMoney(pricing.addOnsAmount, pricing.currency)}
                  </strong>
                </div>
                {pricing.addOns?.length > 0 && (
                  <ul className="calc-addon-lines">
                    {pricing.addOns.map((item) => (
                      <li key={item.name}>
                        <span>{item.name}</span>
                        <span>
                          {formatMoney(item.price, pricing.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
