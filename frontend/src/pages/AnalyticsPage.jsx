import { useEffect, useState } from "react";
import api from "../api/client";
import { Badge } from "../components/ui";
import { statusTone } from "../lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/analytics/farmer").then(({ data }) => setData(data));
  }, []);
  const snap = data?.snapshot || [];
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="font-semibold">Crop heat</p>
        <p className="text-sm text-mute">{data?.seasonalNote}</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <BarChart data={snap}>
              <CartesianGrid stroke="#E7E2D8" />
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="demandKg" fill="#141414" name="Demand kg (14d orders)" radius={6} />
              <Bar dataKey="supplyKg" fill="#2F6B4F" name="Listed supply kg" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {snap.map((s) => (
          <div key={s.product} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{s.product}</p>
              <p className="text-sm text-mute">Price trend {s.priceTrendPct > 0 ? "↑" : "↓"} {Math.abs(s.priceTrendPct)}%</p>
            </div>
            <div className="flex gap-2">
              <Badge className={statusTone(s.demandLevel)}>Demand {s.demandLevel}</Badge>
              <Badge className={statusTone(s.supplyLevel)}>Supply {s.supplyLevel}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
