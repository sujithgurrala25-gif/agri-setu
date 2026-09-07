import { useEffect, useState } from "react";
import api from "../api/client";
import { Stat } from "../components/ui";
import { inr } from "../lib/utils";
import { TransparencyCard } from "./FarmerHome";

export default function BuyerHome() {
  const [bulks, setBulks] = useState([]);
  const [fair, setFair] = useState(null);
  useEffect(() => {
    api.get("/bulk").then(({ data }) => setBulks(data.bulks || []));
    api.post("/pricing/recommend", { productName: "Tomato", listedPrice: 24, quantity: 500 }).then(({ data }) => setFair(data));
  }, []);
  const open = bulks.filter((b) => b.status !== "fulfilled" && b.status !== "cancelled");
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Open RFQs" value={open.length} />
        <Stat label="Tomato fair band" value={fair?.fair?.display || "—"} hint="Use this as a ceiling for bulk preferred price" />
        <Stat label="Direct model" value="0 traders" hint="Farms combine to fill 500 kg" />
      </div>
      <TransparencyCard data={fair?.transparency} />
      <div className="card p-5">
        <p className="font-semibold">How aggregation works</p>
        <p className="mt-2 text-sm text-mute">
          FreshMart asks for 500 kg tomatoes. AgriSetu scores nearby lots by price gap, distance and rating, then fills the
          order: 100 + 150 + 120 + 130 kg from four farms — no wholesaler pooling fee.
        </p>
      </div>
    </div>
  );
}
