import { useEffect, useState } from "react";
import api from "../api/client";
import { Badge, Button, Empty, ErrorText, Field, Input, Select, Textarea } from "../components/ui";
import { inr } from "../lib/utils";

export default function FarmerProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [fair, setFair] = useState(null);
  const [form, setForm] = useState({
    name: "Tomato",
    category: "vegetables",
    pricePerUnit: 22,
    quantityAvailable: 100,
    unit: "kg",
    harvestDate: new Date().toISOString().slice(0, 10),
    description: "Farm-fresh tomatoes for the SIH demo.",
    imageUrl: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800&q=80",
  });

  function load() {
    api.get("/farmers/me/products").then(({ data }) => setProducts(data.products || []));
  }
  useEffect(load, []);

  async function previewPrice() {
    const { data } = await api.post("/pricing/recommend", {
      productName: form.name,
      listedPrice: Number(form.pricePerUnit),
      quantity: Number(form.quantityAvailable),
    });
    setFair(data.fair);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/products", form);
      setFair(data.fair);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save listing");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <form onSubmit={submit} className="card space-y-3 p-5 lg:col-span-2">
        <h2 className="font-semibold">Add produce</h2>
        <ErrorText message={error} />
        <Field label="Product">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Category">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="grains">Grains</option>
            <option value="pulses">Pulses</option>
            <option value="spices">Spices</option>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price / unit (₹)">
            <Input type="number" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
          </Field>
          <Field label="Quantity">
            <Input type="number" value={form.quantityAvailable} onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })} />
          </Field>
        </div>
        <Field label="Harvest date">
          <Input type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} />
        </Field>
        <Field label="Image URL" hint="Upload is supported via API; URL is enough for demo.">
          <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </Field>
        <Field label="Notes">
          <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={previewPrice}>
            Analyse market
          </Button>
          <Button className="flex-1">List produce</Button>
        </div>
        {fair && (
          <div className="rounded-2xl bg-cream p-3 text-sm">
            <p className="font-semibold">Recommended {fair.display}</p>
            <p className="mt-1 text-mute">{fair.listedAdvice}</p>
          </div>
        )}
      </form>
      <div className="lg:col-span-3 space-y-3">
        {!products.length && <Empty title="No lots yet" body="Add 100 kg tomatoes at ₹22 to start the SIH demo." />}
        {products.map((p) => (
          <div key={p._id} className="card flex gap-4 p-4">
            <img src={p.images?.[0]} alt="" className="h-20 w-24 rounded-2xl object-cover" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{p.name}</p>
                <Badge className="bg-cream text-ink">{p.quantityAvailable} {p.unit}</Badge>
              </div>
              <p className="text-sm text-mute">{inr(p.pricePerUnit)}/{p.unit}</p>
              <p className="text-xs text-mute">Harvest {p.harvestDate ? new Date(p.harvestDate).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
