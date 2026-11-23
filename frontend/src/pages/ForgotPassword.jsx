import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { AuthFooterLink, AuthShell } from "../components/auth/AuthShell";
import { Alert, Button, Input, Label } from "../components/ui";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        <AuthFooterLink>
          Remember it?{" "}
          <Link
            to="/login"
            className="text-vault-link hover:text-vault-text transition-colors focus-ring rounded"
          >
            Sign in
          </Link>
        </AuthFooterLink>
      }
    >
      {!submitted ? (
        <>
          <h1 className="text-vault-text font-semibold text-lg mb-1">
            Forgot password?
          </h1>
          <p className="text-vault-subtle text-sm mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {error && (
            <Alert variant="error" className="mb-4">
              <p>{error}</p>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        </>
      ) : (
        <>
          <Alert variant="success" className="mb-4">
            <p>Check your email for a reset link if an account exists.</p>
          </Alert>
          <h2 className="text-vault-text font-semibold text-lg mb-1">
            Email sent
          </h2>
          <p className="text-vault-subtle text-sm mb-5 leading-relaxed">
            If{" "}
            <span className="text-vault-text font-medium">{email}</span> has a
            Vaultix account, you&apos;ll receive a reset link shortly. Check spam
            if it doesn&apos;t arrive.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => setSubmitted(false)}
          >
            Try again
          </Button>
        </>
      )}
    </AuthShell>
  );
}