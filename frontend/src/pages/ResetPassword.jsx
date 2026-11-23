import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { AuthFooterLink, AuthShell } from "../components/auth/AuthShell";
import { Alert, Button, PasswordInput } from "../components/ui";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const hasToken = !!token;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        hasToken && !success ? (
          <AuthFooterLink>
            Back to{" "}
            <Link
              to="/login"
              className="text-vault-link hover:text-vault-text transition-colors focus-ring rounded"
            >
              Sign in
            </Link>
          </AuthFooterLink>
        ) : null
      }
    >
      {!hasToken && (
        <>
          <Alert variant="error" className="mb-4">
            <p>This reset link is missing or invalid.</p>
          </Alert>
          <h1 className="text-vault-text font-semibold text-lg mb-1">
            Invalid link
          </h1>
          <p className="text-vault-subtle text-sm mb-5">
            Please request a new password reset link.
          </p>
          <Button to="/forgot-password" className="w-full">
            Request new link
          </Button>
        </>
      )}

      {hasToken && success && (
        <>
          <Alert variant="success" className="mb-4">
            <p>Password updated successfully.</p>
          </Alert>
          <h2 className="text-vault-text font-semibold text-lg mb-1">
            Password updated
          </h2>
          <p className="text-vault-subtle text-sm mb-5">
            Redirecting you to sign in…
          </p>
          <Button to="/login" className="w-full">
            Go to sign in
          </Button>
        </>
      )}

      {hasToken && !success && (
        <>
          <h1 className="text-vault-text font-semibold text-lg mb-1">
            Set new password
          </h1>
          <p className="text-vault-subtle text-sm mb-6">
            Must be at least 6 characters.
          </p>

          {error && (
            <Alert variant="error" className="mb-4">
              <p>{error}</p>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              id="reset-new"
              label="New password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(v) => set("newPassword", v)}
              placeholder="Min 6 characters"
            />
            <PasswordInput
              id="reset-confirm"
              label="Confirm password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(v) => set("confirmPassword", v)}
              placeholder="Repeat new password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}