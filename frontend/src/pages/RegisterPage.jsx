import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { alertError, btnPrimary, card, input, label } from "../lib/ui.js";
import { getApiErrorMessage } from "../utils/apiError.js";

const FIELDS = [
  { key: "username", label: "Username" },
  { key: "email", label: "Email", type: "email" },
  { key: "password", label: "Password (min. 6 characters)", type: "password" },
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "student_id", label: "Student ID" },
  { key: "semester", label: "Semester", optional: true },
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    student_id: "",
    semester: "",
  });
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate("/login", {
        state: {
          registered: true,
          username: form.username,
        },
      });
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Registration failed. Check your details and try again."
        )
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Join as voter</h1>
          <p className="mt-2 text-slate-400">
            Register with your student details to participate in elections
          </p>
        </div>
        <form onSubmit={handleSubmit} className={`${card} space-y-4`}>
          {FIELDS.map(({ key, label: fieldLabel, type, optional }) => (
            <label key={key} className={label}>
              {fieldLabel}
              <input
                className={input}
                type={type || "text"}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                required={!optional}
              />
            </label>
          ))}
          {error && <div className={alertError}>{error}</div>}
          <button type="submit" className={`${btnPrimary} w-full`}>
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
