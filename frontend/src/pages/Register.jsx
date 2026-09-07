import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, ErrorText, Field, Input, Select } from "../components/ui";
import { homeFor } from "../lib/utils";
import { Leaf } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "farmer",
    farmName: "",
    orgName: "",
    orgType: "supermarket",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await register({
        ...form,
        location: { district: "Pune", state: "Maharashtra", lat: 18.52, lng: 73.85 },
      });
      nav(homeFor(user.role));
    } catch (err) {
      if (!err.response) {
        setError("Network error: Unable to reach AgriSetu server (http://localhost:5000).");
      } else {
        setError(err.response?.data?.message || "Could not register");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2 font-bold">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-white">
          <Leaf size={18} />
        </span>
        AgriSetu
      </Link>
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Create account</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <ErrorText message={error} />
          <Field label="Full name">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required />
          </Field>
          <Field label="I am a">
            <Select value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="farmer">Farmer</option>
              <option value="consumer">Consumer</option>
              <option value="institutional">Restaurant / supermarket / hotel</option>
            </Select>
          </Field>
          {form.role === "farmer" && (
            <Field label="Farm name">
              <Input value={form.farmName} onChange={(e) => set("farmName", e.target.value)} />
            </Field>
          )}
          {form.role === "institutional" && (
            <>
              <Field label="Organisation">
                <Input value={form.orgName} onChange={(e) => set("orgName", e.target.value)} />
              </Field>
              <Field label="Type">
                <Select value={form.orgType} onChange={(e) => set("orgType", e.target.value)}>
                  <option value="supermarket">Supermarket</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hotel</option>
                  <option value="retail">Retail</option>
                </Select>
              </Field>
            </>
          )}
          <Button className="w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-mute">
          Already registered? <Link to="/login" className="font-semibold text-ink">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
