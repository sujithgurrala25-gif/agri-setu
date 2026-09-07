import { useEffect, useState } from "react";
import api from "../api/client";
import { Badge, Button, Empty } from "../components/ui";
import { inr, statusTone } from "../lib/utils";

const FLOW = ["PENDING", "ACCEPTED", "PACKED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

export default function OrdersPage({ farmer }) {
  const [orders, setOrders] = useState([]);

  function load() {
    api.get("/orders").then(({ data }) => setOrders(data.orders || []));
  }
  useEffect(load, []);

  async function setStatus(id, status) {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  }

  if (!orders.length) return <Empty title="No orders" body="Orders will appear here after checkout." />;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o._id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{o.orderNumber}</p>
              <p className="text-sm text-mute">
                {farmer ? o.buyer?.name : o.farmer?.name} · {inr(o.total)}
              </p>
            </div>
            <Badge className={statusTone(o.status)}>{o.status.replaceAll("_", " ")}</Badge>
          </div>
          <ul className="mt-3 text-sm">
            {o.items?.map((i) => (
              <li key={i.name + i.quantity}>
                {i.quantity} {i.unit} {i.name} @ {inr(i.pricePerUnit)}
              </li>
            ))}
          </ul>
          {farmer && (
            <div className="mt-4 flex flex-wrap gap-2">
              {o.status === "PENDING" && (
                <>
                  <Button onClick={() => setStatus(o._id, "ACCEPTED")}>Accept</Button>
                  <Button variant="danger" onClick={() => setStatus(o._id, "REJECTED")}>
                    Reject
                  </Button>
                </>
              )}
              {FLOW.includes(o.status) && o.status !== "DELIVERED" && o.status !== "PENDING" && (
                <Button variant="outline" onClick={() => setStatus(o._id, FLOW[FLOW.indexOf(o.status) + 1])}>
                  Mark {FLOW[FLOW.indexOf(o.status) + 1]?.replaceAll("_", " ")}
                </Button>
              )}
            </div>
          )}
          {!farmer && (
            <a className="mt-3 inline-block text-sm font-semibold text-sky" href={`/app/track/${o._id}`}>
              Track delivery
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
