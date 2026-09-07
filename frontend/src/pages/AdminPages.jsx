import { useEffect, useState } from "react";
import api from "../api/client";
import { Badge, Button, Stat } from "../components/ui";
import { inr, statusTone } from "../lib/utils";

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/analytics/admin").then(({ data }) => setStats(data));
  }, []);
  if (!stats) return <p className="text-sm text-mute">Loading control center…</p>;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Users" value={stats.users} />
        <Stat label="Farmers" value={stats.farmers} />
        <Stat label="Live lots" value={stats.products} />
        <Stat label="Orders" value={stats.orders} />
        <Stat label="GMV (demo)" value={inr(stats.gmv)} />
        <Stat label="Pending KYC" value={stats.pendingVerifications} />
      </div>
      <div className="card p-5">
        <p className="font-semibold">Recent orders</p>
        <div className="mt-3 divide-y divide-line">
          {(stats.recentOrders || []).map((o) => (
            <div key={o._id} className="flex justify-between py-2 text-sm">
              <span>{o.orderNumber} · {o.buyer?.name} → {o.farmer?.name}</span>
              <Badge className={statusTone(o.status)}>{o.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.get("/admin/users").then(({ data }) => setUsers(data.users || []));
  }, []);
  return (
    <div className="card overflow-x-auto p-5">
      <table className="w-full text-left text-sm">
        <thead className="text-mute">
          <tr>
            <th className="pb-2">Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-t border-line">
              <td className="py-2">{u.name}</td>
              <td>{u.email}</td>
              <td className="capitalize">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminFarmers() {
  const [farmers, setFarmers] = useState([]);
  function load() {
    api.get("/admin/farmers").then(({ data }) => setFarmers(data.farmers || []));
  }
  useEffect(load, []);
  async function verify(userId, status) {
    await api.post(`/admin/farmers/${userId}/verify`, { status });
    load();
  }
  return (
    <div className="space-y-3">
      {farmers.map((f) => (
        <div key={f._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-semibold">{f.farmName}</p>
            <p className="text-sm text-mute">
              {f.user?.name} · {f.location?.village} · {f.verificationStatus}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => verify(f.user._id, "verified")}>Verify</Button>
            <Button variant="outline" onClick={() => verify(f.user._id, "pending")}>
              Hold
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminFinance() {
  const [payments, setPayments] = useState([]);
  useEffect(() => {
    api.get("/admin/payments").then(({ data }) => setPayments(data.payments || []));
  }, []);
  return (
    <div className="card overflow-x-auto p-5">
      <table className="w-full text-left text-sm">
        <thead className="text-mute">
          <tr>
            <th className="pb-2">Ref</th>
            <th>Buyer</th>
            <th>Farmer</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id} className="border-t border-line">
              <td className="py-2">{p.reference}</td>
              <td>{p.buyer?.name}</td>
              <td>{p.farmer?.name}</td>
              <td>{inr(p.amount)}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminRisk() {
  const [flags, setFlags] = useState([]);
  const [complaints, setComplaints] = useState([]);
  function load() {
    api.get("/admin/flags").then(({ data }) => setFlags(data.flags || []));
    api.get("/admin/complaints").then(({ data }) => setComplaints(data.complaints || []));
  }
  useEffect(load, []);
  async function resolve(id) {
    await api.patch(`/admin/complaints/${id}`, { status: "resolved" });
    load();
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-5">
        <p className="font-semibold">Automated flags</p>
        {(flags.length ? flags : [{ detail: "No high-risk patterns in the demo dataset." }]).map((f, i) => (
          <p key={i} className="mt-2 rounded-2xl bg-cream p-3 text-sm">
            {f.type && <span className="font-medium">{f.type}: </span>}
            {f.detail}
          </p>
        ))}
      </div>
      <div className="card p-5">
        <p className="font-semibold">Complaints</p>
        {complaints.map((c) => (
          <div key={c._id} className="mt-3 border-t border-line pt-3 text-sm">
            <p className="font-medium">{c.subject}</p>
            <p className="text-mute">{c.details}</p>
            <Button className="mt-2" variant="outline" onClick={() => resolve(c._id)}>
              Mark resolved
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
