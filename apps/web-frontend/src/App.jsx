import React, { useMemo, useState } from "react";
import { createContact } from "./api.js";
import { isIndiaCountry, validate } from "./validators.js";

const initial = {
  firstName: "",
  lastName: "",
  contact: "",
  email: "",
  address: "",
  state: "",
  country: "India",
  pincode: ""
};

function Field({ label, hint, error, span = 6, children }) {
  const spanClass = span === 12 ? " field--span-12" : "";
  return (
    <label className={`field${spanClass}`}>
      <div className="fieldTop">
        <div className="fieldLabel">{label}</div>
        {hint ? <div className="fieldHint">{hint}</div> : null}
      </div>
      {children}
      {error ? <div className="fieldError">{error}</div> : <div className="fieldError fieldError--empty">.</div>}
    </label>
  );
}

export default function App() {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [created, setCreated] = useState(null);

  const errors = useMemo(() => validate(values), [values]);
  const showError = (key) => touched[key] && errors[key];

  const update = (key) => (e) => {
    const next = e.target.value;
    setValues((prev) => {
      const updated = { ...prev, [key]: next };
      if (key === "country" && !isIndiaCountry(next)) updated.pincode = "";
      return updated;
    });
  };

  const onBlur = (key) => () => setTouched((prev) => ({ ...prev, [key]: true }));

  const canSubmit = Object.keys(errors).length === 0 && !isSubmitting;

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");
    setCreated(null);
    setTouched({
      firstName: true,
      lastName: true,
      contact: true,
      email: true,
      address: true,
      state: true,
      country: true,
      pincode: true
    });

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await createContact(values);
      setCreated(result.contact);
      setValues(initial);
      setTouched({});
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const indiaSelected = isIndiaCountry(values.country);

  return (
    <div className="page">
      <div className="bgGlow" aria-hidden="true" />

      <header className="header">
        <div className="badge">Policy Creation</div>
        <h1>Contact Details</h1>
        <p className="sub">
          React form → Contact Service (in-memory, no database). Later: route via API gateway.
        </p>
      </header>

      <main className="card">
        <form onSubmit={onSubmit} className="form">
          <div className="grid">
            <Field label="First Name" error={showError("firstName")}>
              <input
                value={values.firstName}
                onChange={update("firstName")}
                onBlur={onBlur("firstName")}
                placeholder="e.g., Aishik"
                autoComplete="given-name"
              />
            </Field>

            <Field label="Last Name" error={showError("lastName")}>
              <input
                value={values.lastName}
                onChange={update("lastName")}
                onBlur={onBlur("lastName")}
                placeholder="e.g., Maitra"
                autoComplete="family-name"
              />
            </Field>

            <Field label="Contact" hint="Digits only" error={showError("contact")}>
              <input
                value={values.contact}
                onChange={update("contact")}
                onBlur={onBlur("contact")}
                placeholder="e.g., +91 98765 43210"
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>

            <Field label="Email" error={showError("email")}>
              <input
                value={values.email}
                onChange={update("email")}
                onBlur={onBlur("email")}
                placeholder="e.g., name@example.com"
                inputMode="email"
                autoComplete="email"
              />
            </Field>

            <Field label="State" error={showError("state")}>
              <input
                value={values.state}
                onChange={update("state")}
                onBlur={onBlur("state")}
                placeholder="e.g., West Bengal"
                autoComplete="address-level1"
              />
            </Field>

            <Field label="Country" error={showError("country")}>
              <select value={values.country} onChange={update("country")} onBlur={onBlur("country")}>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            {indiaSelected ? (
              <Field label="Pincode" hint="India only" error={showError("pincode")}>
                <input
                  value={values.pincode}
                  onChange={update("pincode")}
                  onBlur={onBlur("pincode")}
                  placeholder="6 digits"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </Field>
            ) : (
              <div className="field field--placeholder">
                <div className="fieldTop">
                  <div className="fieldLabel">Pincode</div>
                  <div className="fieldHint">Shown only for India</div>
                </div>
                <div className="placeholderBox">Select India to enter Pincode.</div>
              </div>
            )}

            <Field label="Address" error={showError("address")} span={12}>
              <textarea
                value={values.address}
                onChange={update("address")}
                onBlur={onBlur("address")}
                placeholder="House/Street, City, Landmark..."
                rows={4}
                autoComplete="street-address"
              />
            </Field>
          </div>

          {serverError ? (
            <div className="alert alert--error" role="alert">
              <div className="alertTitle">Submission failed</div>
              <div className="alertBody">{serverError}</div>
            </div>
          ) : null}

          {created ? (
            <div className="alert alert--success" role="status">
              <div className="alertTitle">Saved in contact-service</div>
              <div className="alertBody">
                ID: <span className="mono">{created.id}</span>
              </div>
            </div>
          ) : null}

          <div className="actions">
            <button className="btn" disabled={!canSubmit} type="submit">
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Sending…
                </>
              ) : (
                "Submit"
              )}
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => {
                setValues(initial);
                setTouched({});
                setServerError("");
                setCreated(null);
              }}
              disabled={isSubmitting}
            >
              Reset
            </button>
          </div>

          <div className="footer">
            <span className="dot" /> Service: <span className="mono">:4001</span>
            <span className="sep">•</span>
            Future gateway: <span className="mono">:4000</span>
          </div>
        </form>
      </main>
    </div>
  );
}
