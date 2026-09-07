import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { Badge, Button, Stat } from "../components/ui";
import { inr, statusTone } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

export default function FarmerHome() {
  const { farmerProfile } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [fair, setFair] = useState(null);

  useEffect(() => {
    api.get("/farmer/earnings").then(({ data }) => setEarnings(data));
    api.get("/orders").then(({ data }) => setOrders(data.orders || []));
    api.get("/farmers/me/products").then(({ data }) => setProducts(data.products || []));
    api
      .post("/pricing/recommend", { productName: "Tomato", listedPrice: 22, quantity: 100 })
      .then(({ data }) => setFair(data));
  }, []);

  const pending = orders.filter((o) => o.status === "PENDING");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Gross earnings" value={inr(earnings?.grossEarnings || 0)} hint="Accepted and later statuses" />
        <Stat label="Open orders" value={pending.length} hint="Waiting for accept/reject" />
        <Stat label="Active lots" value={products.filter((p) => p.isActive).length} />
        <Stat
          label="Trust"
          value={farmerProfile?.verificationStatus === "verified" ? "Verified" : "Pending"}
          hint={`${farmerProfile?.rating || 0} ★ · ${farmerProfile?.completedOrders || 0} completed`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Incoming orders</h2>
            <Link to="/app/farmer/orders" className="text-sm font-medium text-sky">
              View all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-line">
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-mute">{o.buyer?.name} · {inr(o.subtotal)}</p>
                </div>
                <Badge className={statusTone(o.status)}>{o.status.replaceAll("_", " ")}</Badge>
              </div>
            ))}
            {!orders.length && <p className="py-6 text-sm text-mute">No orders yet. List produce to start receiving them.</p>}
          </div>
        </div>
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold">Tomato fair-price band</h2>
          <p className="mt-2 text-3xl font-bold">{fair?.fair?.display || "…"}</p>
          <p className="mt-1 text-sm text-mute">{fair?.fair?.listedAdvice}</p>
          <ul className="mt-3 space-y-1 text-sm text-mute">
            {(fair?.fair?.reasons || []).slice(0, 3).map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
          <Link to="/app/farmer/price">
            <Button className="mt-4 w-full">Open advisor</Button>
          </Link>
        </div>
      </div>

      {fair?.transparency && <TransparencyCard data={fair.transparency} />}
    </div>
  );
}

export function TransparencyCard({ data }) {
  if (!data) return null;
  return (
    <div className="card grid gap-4 p-5 md:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-mute">Traditional chain</p>
        <div className="mt-3 space-y-2">
          {data.traditional.steps.map((s) => (
            <div key={s.actor} className="flex items-center justify-between rounded-2xl bg-cream px-3 py-2 text-sm">
              <span>{s.actor}</span>
              <span className="font-semibold">{inr(s.price)}/kg</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-mute">Direct marketplace</p>
        <div className="mt-3 space-y-2">
          {data.direct.steps.map((s) => (
            <div key={s.actor} className="flex items-center justify-between rounded-2xl bg-ink px-3 py-2 text-sm text-white">
              <span>{s.actor}</span>
              <span className="font-semibold">{inr(s.price)}/kg</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm">
          Farmer earns <b>{data.insight.farmerUpliftPct}%</b> more. Buyer saves about <b>{data.insight.consumerSavePct}%</b>.{" "}
          {data.insight.intermediariesRemoved} extra hops removed.
        </p>
      </div>
    </div>
  );
}
