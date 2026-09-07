import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { Badge } from "../components/ui";
import { statusTone } from "../lib/utils";
import FarmMap from "../components/FarmMap";

export default function TrackOrder() {
  const { id } = useParams();
  const [pack, setPack] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setPack(data));
  }, [id]);

  if (!pack) return <p className="text-sm text-mute">Loading tracking…</p>;
  const { order, delivery } = pack;
  const points = delivery
    ? [{ lat: delivery.currentLat, lng: delivery.currentLng, productId: "farm", farmName: "Farm / courier", product: order.status, pricePerUnit: 0, quantityAvailable: 0, distanceKm: 0 }]
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="card p-5 lg:col-span-3">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">{order.orderNumber}</p>
            <p className="text-sm text-mute">ETA about {order.etaMinutes} minutes (simulated)</p>
          </div>
          <Badge className={statusTone(order.status)}>{order.status.replaceAll("_", " ")}</Badge>
        </div>
        <ol className="mt-6 space-y-3">
          {(order.statusHistory || []).map((s, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-1 h-2 w-2 rounded-full bg-ink" />
              <div>
                <p className="font-medium">{s.status.replaceAll("_", " ")}</p>
                <p className="text-mute">{new Date(s.at).toLocaleString()} {s.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="card p-4 lg:col-span-2">
        <FarmMap origin={{ lat: delivery?.destLat || 18.52, lng: delivery?.destLng || 73.85 }} points={points} />
        <p className="mt-3 text-xs text-mute">{delivery?.driverName}</p>
      </div>
    </div>
  );
}
