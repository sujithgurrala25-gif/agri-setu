import { useEffect, useState } from "react";
import api from "../api/client";
import { Stat } from "../components/ui";
import { inr } from "../lib/utils";

export default function Earnings() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/farmer/earnings").then(({ data }) => setData(data));
  }, []);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Gross (accepted+)" value={inr(data?.grossEarnings || 0)} />
        <Stat label="Delivered earnings" value={inr(data?.deliveredEarnings || 0)} />
        <Stat label="Orders counted" value={data?.orderCount || 0} />
      </div>
      <div className="card overflow-x-auto p-5">
        <table className="w-full text-left text-sm">
          <thead className="text-mute">
            <tr>
              <th className="pb-2">Order</th>
              <th>Status</th>
              <th>Farmer share</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recent || []).map((o) => (
              <tr key={o._id} className="border-t border-line">
                <td className="py-2">{o.orderNumber}</td>
                <td>{o.status}</td>
                <td>{inr(o.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
