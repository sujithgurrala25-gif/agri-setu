import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { Badge, Button, Field, Textarea } from "../components/ui";
import { inr, statusTone } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

export default function FarmerPublic() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [pack, setPack] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  function load() {
    api.get(`/farmers/${userId}`).then(({ data }) => setPack(data));
  }
  useEffect(load, [userId]);
  if (!pack) return null;
  const f = pack.farmer;

  async function review(e) {
    e.preventDefault();
    await api.post("/reviews", { farmer: f.id, rating, comment });
    setComment("");
    load();
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold">{f.farmName}</h2>
          <Badge className={statusTone(f.verificationStatus)}>
            {f.verificationStatus === "verified" ? "Verified farmer" : "Verification pending"}
          </Badge>
        </div>
        <p className="text-mute">{f.name} · {f.location?.village}, {f.location?.district}</p>
        <p className="mt-2 text-sm">{f.bio}</p>
        <p className="mt-2 text-sm">{f.rating} ★ · {f.reviewCount} reviews · {f.completedOrders} completed orders</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {pack.products.map((p) => (
          <Link key={p._id} to={`/app/product/${p._id}`} className="card p-4">
            <p className="font-semibold">{p.name}</p>
            <p className="text-sm text-mute">{inr(p.pricePerUnit)}/{p.unit} · {p.quantityAvailable} {p.unit}</p>
          </Link>
        ))}
      </div>
      {user?.role === "consumer" && (
        <form onSubmit={review} className="card space-y-3 p-5">
          <p className="font-semibold">Leave a review</p>
          <Field label="Rating 1–5">
            <input type="number" min={1} max={5} className="w-full rounded-2xl border border-line px-3 py-2" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </Field>
          <Field label="Comment">
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
          <Button>Submit review</Button>
        </form>
      )}
    </div>
  );
}
