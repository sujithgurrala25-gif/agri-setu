import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import FarmMap from "../components/FarmMap";
import { Badge, Select } from "../components/ui";
import { inr, PUNE, statusTone } from "../lib/utils";

export default function Nearby() {
  const [sort, setSort] = useState("nearest");
  const [product, setProduct] = useState("Tomato");
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    api
      .get("/products/nearby", { params: { ...PUNE, sort, product } })
      .then(({ data }) => setFarmers(data.farmers || []));
  }, [sort, product]);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="card p-4 lg:col-span-3">
        <FarmMap origin={PUNE} points={farmers} />
      </div>
      <div className="space-y-3 lg:col-span-2">
        <div className="card grid gap-2 p-4">
          <input
            className="rounded-2xl border border-line bg-cream/40 px-3 py-2.5 text-sm"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="nearest">Nearest</option>
            <option value="price">Lowest price</option>
            <option value="rating">Highest rating</option>
            <option value="availability">Highest availability</option>
          </Select>
        </div>
        {farmers.map((f) => (
          <Link key={f.productId} to={`/app/product/${f.productId}`} className="card block p-4">
            <div className="flex justify-between">
              <p className="font-semibold">{f.farmName}</p>
              <p className="font-bold">{inr(f.pricePerUnit)}/kg</p>
            </div>
            <p className="text-sm text-mute">
              {f.product} · {f.distanceKm} km · {f.quantityAvailable} kg · {f.rating}★
            </p>
            <Badge className={`mt-2 ${statusTone(f.verificationStatus)}`}>
              {f.verificationStatus === "verified" ? "Verified" : "Pending"}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
