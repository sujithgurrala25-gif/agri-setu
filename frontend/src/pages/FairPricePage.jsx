import { useEffect, useState } from "react";
import api from "../api/client";
import { Button, Field, Input } from "../components/ui";
import { TransparencyCard } from "./FarmerHome";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { inr } from "../lib/utils";

export default function FairPricePage() {
  const [productName, setProductName] = useState("Tomato");
  const [listedPrice, setListedPrice] = useState(22);
  const [quantity, setQuantity] = useState(100);
  const [pack, setPack] = useState(null);
  const [history, setHistory] = useState([]);

  async function run(e) {
    e?.preventDefault();
    const { data } = await api.post("/pricing/recommend", { productName, listedPrice: Number(listedPrice), quantity: Number(quantity) });
    setPack(data);
    const h = await api.get("/pricing/history", { params: { product: productName } });
    setHistory(h.data.history || []);
  }

  useEffect(() => {
    run();
  }, []);

  const fair = pack?.fair;

  return (
    <div className="space-y-4">
      <form onSubmit={run} className="card grid gap-3 p-5 md:grid-cols-4">
        <Field label="Crop">
          <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
        </Field>
        <Field label="Your list price">
          <Input type="number" value={listedPrice} onChange={(e) => setListedPrice(e.target.value)} />
        </Field>
        <Field label="Quantity kg">
          <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </Field>
        <div className="flex items-end">
          <Button className="w-full">Recommend</Button>
        </div>
      </form>

      {fair && (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="card p-5 lg:col-span-2">
            <p className="text-xs uppercase tracking-wide text-mute">Suggested selling band</p>
            <p className="mt-2 text-4xl font-bold">{fair.display}</p>
            <p className="mt-1 text-sm">Midpoint {inr(fair.recommended)}/kg · method: {fair.method}</p>
            <p className="mt-3 rounded-2xl bg-cream p-3 text-sm">{fair.listedAdvice}</p>
            <p className="mt-3 text-xs text-mute">
              Mandi {inr(fair.marketCurrent)} · history {inr(fair.historicalAvg)} · demand {fair.demandLevel} · supply {fair.supplyLevel}
            </p>
          </div>
          <div className="card p-5 lg:col-span-3">
            <p className="font-semibold">Why this band</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-mute">
              {fair.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className="card p-5">
        <p className="font-semibold">Mandi vs direct average (seeded 90 days)</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D8" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="mandiPrice" stroke="#141414" dot={false} name="Mandi" />
              <Line type="monotone" dataKey="directAvgPrice" stroke="#2F6B4F" dot={false} name="Direct avg" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <TransparencyCard data={pack?.transparency} />
    </div>
  );
}
