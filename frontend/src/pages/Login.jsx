import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, ErrorText, Field, Input } from "../components/ui";
import { homeFor } from "../lib/utils";
import { Leaf } from "lucide-react";

const DEMOS = [
  { role: "Farmer", email: "ramesh@agrisetu.in", password: "Farmer@123" },
  { role: "Consumer", email: "ananya@agrisetu.in", password: "Consumer@123" },
  { role: "Buyer", email: "procurement@freshmart.in", password: "Buyer@123" },
  { role: "Admin", email: "admin@agrisetu.in", password: "Admin@123" },
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("ramesh@agrisetu.in");
  const [password, setPassword] = useState("Farmer@123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(email, password);
      nav(homeFor(user.role));
    } catch (err) {
      if (!err.response) {
        setError("Network error: Unable to reach AgriSetu server (http://localhost:5000).");
      } else {
        setError(err.response?.data?.message || "Could not sign in");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link to="/" className="mb-6 flex items-center gap-2 font-bold">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-white">
          <Leaf size={18} />
        </span>
        AgriSetu
      </Link>
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-mute">Use a seeded demo account for the SIH walkthrough.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <ErrorText message={error} />
          <Field label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </Field>
          <Field label="Password">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </Field>
          <Button className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Continue"}
          </Button>
        </form>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {DEMOS.map((d) => (
            <button
              key={d.email}
              type="button"
              className="rounded-2xl border border-line bg-cream px-3 py-2 text-left text-xs"
              onClick={() => {
                setEmail(d.email);
                setPassword(d.password);
              }}
            >
              <p className="font-semibold">{d.role}</p>
              <p className="truncate text-mute">{d.email}</p>
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-mute">
          No account? <Link to="/register" className="font-semibold text-ink">Register</Link>
        </p>
      </div>
    </div>
  );
}
