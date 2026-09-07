import { useEffect, useState } from "react";
import api from "../api/client";
import { Button, Empty, Field, Input, Textarea } from "../components/ui";
import { inr, PUNE } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

export default function BulkPage() {
  const { user } = useAuth();
  const isBuyer = user?.role === "institutional" || user?.role === "admin";
  const [bulks, setBulks] = useState([]);
  const [form, setForm] = useState({
    productName: "Tomato",
    quantityKg: 500,
    preferredPrice: 24,
    notes: "Weekly store replenishment",
    deliveryCity: "Pune",
    ...PUNE,
    deliveryLat: PUNE.lat,
    deliveryLng: PUNE.lng,
  });

  function load() {
    api.get("/bulk").then(({ data }) => setBulks(data.bulks || []));
  }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    await api.post("/bulk", form);
    load();
  }

  async function match(id) {
    await api.post(`/bulk/${id}/match`);
    load();
  }

  async function accept(bulkId, allocationId, yes) {
    await api.post(`/bulk/${bulkId}/accept`, { allocationId, accept: yes });
    load();
  }

  return (
    <div className="space-y-4">
      {isBuyer && (
        <form onSubmit={create} className="card grid gap-3 p-5 md:grid-cols-4">
          <Field label="Crop">
            <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
          </Field>
          <Field label="Need (kg)">
            <Input type="number" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} />
          </Field>
          <Field label="Preferred ₹/kg">
            <Input type="number" value={form.preferredPrice} onChange={(e) => setForm({ ...form, preferredPrice: e.target.value })} />
          </Field>
          <div className="flex items-end">
            <Button className="w-full">Create bulk RFQ</Button>
          </div>
          <div className="md:col-span-4">
            <Field label="Notes">
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
        </form>
      )}

      {!bulks.length && <Empty title="No bulk demand" body="FreshMart can request 500 kg tomatoes, then run Match farmers." />}

      {bulks.map((b) => (
        <div key={b._id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">
                {b.quantityKg} kg {b.productName}
              </p>
              <p className="text-sm text-mute">
                {b.buyer?.orgName || b.buyer?.name} · preferred {inr(b.preferredPrice)}/kg · matched {b.matchedKg || 0} kg · {b.status}
              </p>
            </div>
            {isBuyer && (
              <Button onClick={() => match(b._id)}>Match farmers</Button>
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-mute">
                <tr>
                  <th className="pb-2">Farm</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Distance</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(b.allocations || []).map((a) => (
                  <tr key={a._id} className="border-t border-line">
                    <td className="py-2">{a.farmName}</td>
                    <td>{a.quantityKg} kg</td>
                    <td>{inr(a.pricePerUnit)}</td>
                    <td>{a.distanceKm} km</td>
                    <td>
                      <span className="rounded-full bg-cream px-2 py-1 text-xs">{a.status}</span>
                    </td>
                    <td className="text-right">
                      {a.status === "proposed" && user?.role === "farmer" && (
                        <Button onClick={() => accept(b._id, a._id, true)}>Accept share</Button>
                      )}
                      {a.status === "proposed" && isBuyer && (
                        <Button variant="outline" onClick={() => accept(b._id, a._id, true)}>
                          Confirm
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!b.allocations?.length && <p className="mt-3 text-sm text-mute">Run matching to combine nearby tomato lots until 500 kg is filled.</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
