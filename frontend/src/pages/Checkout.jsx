import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { Button, ErrorText, Field, Input, Select } from "../components/ui";
import { inr, PUNE } from "../lib/utils";
import { TransparencyCard } from "./FarmerHome";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [addr, setAddr] = useState({ line1: "Koregaon Park", city: "Pune", pincode: "411001", ...PUNE });
  const [method, setMethod] = useState("demo_upi");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function pay(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/orders", {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: addr,
        paymentMethod: method,
      });
      setResult(data);
      clear();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="card p-6">
          <p className="text-sm text-sage font-semibold">Demo payment successful</p>
          <h2 className="mt-1 text-2xl font-bold">{result.order.orderNumber}</h2>
          <p className="text-mute">Paid {inr(result.order.total)} · waiting for farmer acceptance</p>
          <Button className="mt-4" onClick={() => nav(`/app/track/${result.order._id}`)}>
            Track order
          </Button>
        </div>
        <TransparencyCard data={result.transparency} />
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="grid gap-4 lg:grid-cols-5">
      <div className="card space-y-3 p-5 lg:col-span-3">
        <ErrorText message={error} />
        <Field label="Address">
          <Input value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <Input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
          </Field>
          <Field label="PIN">
            <Input value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} />
          </Field>
        </div>
        <Field label="Demo payment">
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="demo_upi">UPI (simulated)</option>
            <option value="demo_card">Card (simulated)</option>
            <option value="demo_cod">Cash on delivery (simulated)</option>
          </Select>
        </Field>
      </div>
      <div className="card p-5 lg:col-span-2">
        <p className="text-sm text-mute">Farm subtotal {inr(total)}</p>
        <p className="text-sm text-mute">Fees calculated by server on submit</p>
        <Button className="mt-4 w-full" disabled={busy || !items.length}>
          {busy ? "Processing…" : "Pay & place order"}
        </Button>
      </div>
    </form>
  );
}
