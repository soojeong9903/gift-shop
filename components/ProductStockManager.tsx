"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  stock: number;
  cost: number;
};

export default function ProductStockManager({
  products,
}: {
  products: Product[];
}) {
  const [stocks, setStocks] = useState<Record<string, number>>(
    Object.fromEntries(products.map((product) => [product.id, product.stock])),
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const updateStock = async (productId: string) => {
    const newStock = stocks[productId];

    if (newStock < 0) {
      alert("재고는 0보다 작을 수 없습니다.");
      return;
    }

    setSavingId(productId);

    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", productId);

    setSavingId(null);

    if (error) {
      alert(`재고 수정 실패: ${error.message}`);
      return;
    }

    alert("재고가 수정되었습니다.");
  };

  return (
    <section className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-black">📦 상품 재고 관리</h2>

      <div className="grid gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-[1fr_100px_100px]"
          >
            <div>
              <p className="font-semibold text-black">{product.name}</p>
              <p className="text-sm text-gray-500">{product.cost}pt</p>
            </div>

            <input
              type="number"
              min={0}
              value={stocks[product.id]}
              onChange={(e) =>
                setStocks({
                  ...stocks,
                  [product.id]: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border px-3 py-2 text-black"
            />

            <button
              onClick={() => updateStock(product.id)}
              disabled={savingId === product.id}
              className="rounded-xl bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {savingId === product.id ? "저장 중" : "저장"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
