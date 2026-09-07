import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Button, Empty, Input } from "../components/ui";
import { inr } from "../lib/utils";

export default function CartPage() {
  const { items, updateQty, total, clear } = useCart();
  if (!items.length) return <Empty title="Cart is empty" body="Browse the marketplace and add a tomato lot." />;
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        {items.map((i) => (
          <div key={i.productId} className="card flex items-center gap-4 p-4">
            <img src={i.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <div className="flex-1">
              <p className="font-semibold">{i.name}</p>
              <p className="text-sm text-mute">{inr(i.pricePerUnit)}/{i.unit}</p>
            </div>
            <Input type="number" className="w-20" value={i.quantity} onChange={(e) => updateQty(i.productId, Number(e.target.value))} />
          </div>
        ))}
        <Button variant="ghost" onClick={clear}>Clear cart</Button>
      </div>
      <div className="card p-5 lg:col-span-2">
        <p className="text-mute">Subtotal (farm price)</p>
        <p className="text-3xl font-bold">{inr(total)}</p>
        <p className="mt-2 text-sm text-mute">Logistics and platform fees are added at checkout. No trader or wholesaler markup.</p>
        <Link to="/app/checkout">
          <Button className="mt-4 w-full">Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
