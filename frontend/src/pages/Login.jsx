import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../api/client";
import { AuthFooterLink, AuthShell } from "../components/auth/AuthShell";
import { Alert, Button, Input, Label, PasswordInput } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        <AuthFooterLink>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-vault-link hover:text-vault-text transition-colors focus-ring rounded"
          >
            Sign up
          </Link>
        </AuthFooterLink>
      }
    >
      <h1 className="text-vault-text font-semibold text-lg mb-1">
        Welcome back
      </h1>
      <p className="text-vault-subtle text-sm mb-6">Sign in to your account</p>

      {error && (
        <Alert variant="error" className="mb-4">
          <p>{error}</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
          />
        </div>
        <PasswordInput
          id="login-password"
          label="Password"
          required
          autoComplete="current-password"
          value={form.password}
          onChange={(v) => setForm((f) => ({ ...f, password: v }))}
          placeholder="Your password"
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-vault-subtle hover:text-vault-link transition-colors focus-ring rounded px-1"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}