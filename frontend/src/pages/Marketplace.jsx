import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { Badge, Empty, Input, Select } from "../components/ui";
import { inr, PUNE, statusTone } from "../lib/utils";

export default function Marketplace() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("nearest");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { q, sort, lat: PUNE.lat, lng: PUNE.lng } })
      .then(({ data }) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [q, sort]);

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap gap-3 p-4">
        <Input placeholder="Search crop (try Tomato)" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="nearest">Nearest</option>
          <option value="price">Lowest price</option>
          <option value="rating">Highest rating</option>
          <option value="availability">Highest availability</option>
        </Select>
      </div>
      {loading && <p className="text-sm text-mute">Loading listings…</p>}
      {!loading && !products.length && <Empty title="No produce" body="Try another crop name." />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <Link key={p._id} to={`/app/product/${p._id}`} className="card overflow-hidden">
            <img src={p.images?.[0]} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-mute">{p.farmName} · {p.farmerName}</p>
                </div>
                <p className="text-lg font-bold">{inr(p.pricePerUnit)}<span className="text-xs font-medium text-mute">/{p.unit}</span></p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-cream">{p.distanceKm ?? "—"} km</Badge>
                <Badge className="bg-cream">{p.quantityAvailable} {p.unit}</Badge>
                <Badge className={statusTone(p.verificationStatus)}>
                  {p.verificationStatus === "verified" ? "Verified" : "Pending"}
                </Badge>
                <Badge className="bg-cream">{p.rating} ★</Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
