import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { Badge, Button, Input } from "../components/ui";
import { inr, PUNE, statusTone } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { TransparencyCard } from "./FarmerHome";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const { user } = useAuth();
  const [pack, setPack] = useState(null);
  const [qty, setQty] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`, { params: PUNE }).then(({ data }) => setPack(data));
  }, [id]);

  useEffect(() => {
    if (pack?.product?.farmer?._id) {
      api.get("/reviews", { params: { farmer: pack.product.farmer._id } }).then(({ data }) => setReviews(data.reviews || []));
    }
  }, [pack?.product?.farmer?._id]);

  if (!pack) return <p className="text-sm text-mute">Loading product…</p>;
  const p = pack.product;
  const farmerId = p.farmer?._id || p.farmer;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="card overflow-hidden lg:col-span-3">
          <img src={p.images?.[0]} alt="" className="h-72 w-full object-cover" />
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold">{p.name}</h2>
              <Badge className={statusTone(p.farmerProfile?.verificationStatus)}>
                {p.farmerProfile?.verificationStatus === "verified" ? "Verified farmer" : "Verification pending"}
              </Badge>
            </div>
            <p className="mt-1 text-mute">{p.description}</p>
            <p className="mt-3 text-3xl font-bold">
              {inr(p.pricePerUnit)}
              <span className="text-base font-medium text-mute">/{p.unit}</span>
            </p>
            <p className="text-sm text-mute">
              {p.quantityAvailable} {p.unit} available · {p.distanceKm ?? "—"} km · Harvest{" "}
              {p.harvestDate ? new Date(p.harvestDate).toLocaleDateString() : "—"}
            </p>
            {(user?.role === "consumer" || user?.role === "institutional") && (
              <div className="mt-4 flex gap-2">
                <Input type="number" className="w-24" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                <Button
                  onClick={() => {
                    add(p, qty);
                    setAdded(true);
                  }}
                >
                  Add to cart
                </Button>
                <Link to="/app/cart" className="rounded-2xl border border-line px-4 py-2.5 text-sm font-semibold">
                  {added ? "Go to cart" : "Cart"}
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <Link to={`/app/farmer/${farmerId}`} className="card block p-5">
            <p className="text-xs uppercase text-mute">Sold by</p>
            <p className="mt-1 text-lg font-semibold">{p.farmerProfile?.farmName}</p>
            <p className="text-sm text-mute">{p.farmer?.name}</p>
            <p className="mt-2 text-sm">
              {p.farmerProfile?.rating} ★ · {p.farmerProfile?.completedOrders} completed orders · {p.farmerProfile?.location?.village}
            </p>
          </Link>
          <div className="card p-5">
            <p className="font-semibold">Fair-price check</p>
            <p className="mt-2 text-2xl font-bold">{pack.fair?.display}</p>
            <p className="mt-1 text-sm text-mute">{pack.fair?.listedAdvice}</p>
          </div>
        </div>
      </div>
      <TransparencyCard data={pack.transparency} />
      <div className="card p-5">
        <p className="font-semibold">Compare nearby {p.name}</p>
        <div className="mt-3 divide-y divide-line">
          {(pack.comparables || []).map((c) => (
            <Link key={c._id} to={`/app/product/${c._id}`} className="flex justify-between py-2 text-sm">
              <span>{c.farmerProfile?.farmName}</span>
              <span className="font-semibold">{inr(c.pricePerUnit)}/{c.unit} · {c.quantityAvailable} {c.unit}</span>
            </Link>
          ))}
          {!pack.comparables?.length && <p className="text-sm text-mute">No other lots of this crop right now.</p>}
        </div>
      </div>
      <div className="card p-5">
        <p className="font-semibold">Reviews</p>
        {reviews.map((r) => (
          <div key={r._id} className="mt-3 border-t border-line pt-3 text-sm">
            <p className="font-medium">{r.reviewer?.name} · {r.rating}★</p>
            <p className="text-mute">{r.comment}</p>
          </div>
        ))}
        {!reviews.length && <p className="mt-2 text-sm text-mute">No reviews yet.</p>}
      </div>
    </div>
  );
}
