import { Link } from "react-router-dom";
import { ArrowRight, Leaf, MapPin, Scale, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-white">
            <Leaf size={18} />
          </span>
          AgriSetu
        </div>
        <div className="flex gap-2">
          <Link to="/login" className="rounded-2xl px-4 py-2 text-sm font-semibold">
            Sign in
          </Link>
          <Link to="/register" className="rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white">
            Create account
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-sage">SIH marketplace prototype</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">
            Cut the middlemen. Pay farmers fairly. Buy produce at a honest price.
          </h1>
          <p className="mt-4 text-lg text-mute">
            AgriSetu connects farms directly with households and institutions. Transparent rupees, location matching, and
            multi-farmer bulk fulfilment — without a trader ladder.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
              Start as a farmer <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="rounded-2xl border border-line bg-white px-5 py-3 text-sm font-semibold">
              Demo login
            </Link>
          </div>
        </div>
        <div className="card grid gap-3 p-5">
          <div className="rounded-2xl bg-ink p-5 text-white">
            <p className="text-xs text-white/60">Tomato · Pune mandi vs AgriSetu</p>
            <p className="mt-2 text-3xl font-bold">Farmer ₹15 → ₹24</p>
            <p className="text-sm text-white/70">Consumer ₹30 → ₹27 · three intermediaries removed</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["₹24–26", "Fair band"],
              ["5 km", "Nearest farm"],
              ["500 kg", "Bulk match"],
            ].map(([a, b]) => (
              <div key={b} className="rounded-2xl bg-cream p-3">
                <p className="text-lg font-bold">{a}</p>
                <p className="text-xs text-mute">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-4">
        {[
          { icon: Scale, t: "Fair price", d: "Rule-based band from mandi, history, demand and supply — with reasons, not magic." },
          { icon: MapPin, t: "Nearby farms", d: "Sort by distance, price, rating or stock. OSM map, no paid map key." },
          { icon: Users, t: "Group lots", d: "A 500 kg supermarket order is split across farms that actually have stock." },
          { icon: Leaf, t: "Verified farms", d: "Admin verification and reviews so buyers trust the listing." },
        ].map((x) => (
          <div key={x.t} className="card p-5">
            <x.icon className="text-sage" size={20} />
            <p className="mt-3 font-semibold">{x.t}</p>
            <p className="mt-1 text-sm text-mute">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
