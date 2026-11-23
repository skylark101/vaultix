import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../api/client";
import { AuthFooterLink, AuthShell } from "../components/auth/AuthShell";
import { Alert, Button, Input, Label, PasswordInput } from "../components/ui";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", form);
      login(data.user, data.token);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        <AuthFooterLink>
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-vault-link hover:text-vault-text transition-colors focus-ring rounded"
          >
            Sign in
          </Link>
        </AuthFooterLink>
      }
    >
      <h1 className="text-vault-text font-semibold text-lg mb-1">
        Create account
      </h1>
      <p className="text-vault-subtle text-sm mb-6">
        Start tracking your assets
      </p>

      {error && (
        <Alert variant="error" className="mb-4">
          <p>{error}</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="signup-name">Name</Label>
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
          />
        </div>
        <div>
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
          />
        </div>
        <PasswordInput
          id="signup-password"
          label="Password"
          required
          minLength={6}
          autoComplete="new-password"
          value={form.password}
          onChange={(v) => setForm((f) => ({ ...f, password: v }))}
          placeholder="Min 6 characters"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}