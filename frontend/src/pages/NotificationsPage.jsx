import { useEffect, useState } from "react";
import api from "../api/client";
import { Button, Empty } from "../components/ui";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  function load() {
    api.get("/notifications").then(({ data }) => setItems(data.notifications || []));
  }
  useEffect(load, []);
  async function readAll() {
    await api.post("/notifications/read-all");
    load();
  }
  if (!items.length) return <Empty title="No notifications" body="Order and verification events will land here." />;
  return (
    <div className="space-y-3">
      <Button variant="ghost" onClick={readAll}>
        Mark all read
      </Button>
      {items.map((n) => (
        <div key={n._id} className={`card p-4 ${n.read ? "opacity-60" : ""}`}>
          <p className="text-xs uppercase text-mute">{n.type}</p>
          <p className="font-semibold">{n.title}</p>
          <p className="text-sm text-mute">{n.body}</p>
        </div>
      ))}
    </div>
  );
}
