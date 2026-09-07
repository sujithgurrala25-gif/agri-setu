import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);
const KEY = "agrisetu_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });

  function persist(next) {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function add(product, qty = 1) {
    const existing = items.find((i) => i.productId === product._id);
    if (existing) {
      persist(items.map((i) => (i.productId === product._id ? { ...i, quantity: i.quantity + qty } : i)));
    } else {
      persist([
        ...items,
        {
          productId: product._id,
          name: product.name,
          pricePerUnit: product.pricePerUnit,
          unit: product.unit,
          quantity: qty,
          farmer: product.farmer?._id || product.farmer,
          image: product.images?.[0],
          farmName: product.farmerProfile?.farmName,
        },
      ]);
    }
  }

  function updateQty(productId, quantity) {
    persist(items.map((i) => (i.productId === productId ? { ...i, quantity } : i)).filter((i) => i.quantity > 0));
  }

  function clear() {
    persist([]);
  }

  const total = items.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);
  const value = useMemo(() => ({ items, add, updateQty, clear, total }), [items, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
