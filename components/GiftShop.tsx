"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  stock: number;
  cost: number;
};

type CartItem = Product & {
  quantity: number;
};

const MAX_POINTS = 6;

export default function GiftShop({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [contactType, setContactType] = useState("kakao");
  const [contactValue, setContactValue] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usedPoints = cart.reduce(
    (sum, item) => sum + item.cost * item.quantity,
    0,
  );

  const remainingPoints = MAX_POINTS - usedPoints;

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!contactValue.trim()) {
      alert("연락처를 입력해주세요.");
      return;
    }

    if (cart.length === 0) {
      alert("선물을 하나 이상 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerName.trim(),
        contact_type: contactType,
        contact_value: contactValue.trim(),
        note: note.trim() || null,
        total_cost: usedPoints,
      })
      .select()
      .single();

    if (orderError) {
      alert(`주문 저장 실패: ${orderError.message}`);
      setIsSubmitting(false);
      return;
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      cost: item.cost,
    }));

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemError) {
      alert(`주문 상품 저장 실패: ${itemError.message}`);
      setIsSubmitting(false);
      return;
    }

    const stockItems = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));

    const { error: stockError } = await supabase.rpc("decrease_product_stock", {
      items: stockItems,
    });

    if (stockError) {
      alert(`재고 차감 실패: ${stockError.message}`);
      setIsSubmitting(false);
      return;
    }

    alert("주문이 완료되었습니다!");

    setCart([]);
    setCustomerName("");
    setContactType("kakao");
    setContactValue("");
    setNote("");
    setIsSubmitting(false);

    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-pink-50 px-4 py-8 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-black">
            🎁 Soojeong's Gift Shop
          </h1>

          <a
            href="/admin"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm border hover:bg-gray-100"
          >
            admin
          </a>
        </div>
        <p className="mb-8 text-gray-600">
          원하는 선물을 골라주세요. 한 사람당 최대 6포인트까지 선택 가능합니다.
        </p>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border sm:p-5 overflow-hidden">
          <h2 className="text-xl font-bold text-black mb-3">🛒 장바구니</h2>
          <p className="text-gray-600 mb-2">선택한 상품: {cart.length}개</p>
          {cart.length === 0 ? (
            <p className="text-gray-500">아직 선택한 선물이 없습니다.</p>
          ) : (
            <ul className="space-y-2 text-black">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div>
                    <span>{item.name}</span>
                    <span className="ml-2 text-gray-500">{item.cost}pt</span>
                  </div>

                  <button
                    onClick={() => {
                      setCart(
                        cart.filter((cartItem) => cartItem.id !== item.id),
                      );
                    }}
                    className="rounded-lg bg-red-100 px-3 py-1 text-red-600 hover:bg-red-200"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}
          <hr className="my-3" />
          <p className="text-black">사용 포인트: {usedPoints}</p>
          <p className="font-semibold text-black">
            남은 포인트: {remainingPoints}
          </p>
        </div>

        {/*order */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm border">
          <h2 className="text-xl font-bold text-black mb-4">📝 주문자 정보</h2>

          <div className="grid gap-3">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="이름 *"
              className="w-full rounded-xl border px-4 py-3 text-black"
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[220px_1fr]">
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value)}
                className="w-full rounded-xl border px-3 py-3 text-black"
              >
                <option value="kakao">Kakaotalk ID</option>
                <option value="instagram">Instagram ID</option>
                <option value="phone">Phone Number</option>
                <option value="discord">Discord ID</option>
                <option value="other">Other</option>
              </select>
              <input
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder="연락처 입력 *"
                className="w-full min-w-0 rounded-xl border px-4 py-3 text-black"
              />
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="메모"
              className="w-full rounded-xl border px-4 py-3 text-black"
            />

            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="rounded-xl bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {isSubmitting ? "제출 중..." : "주문 제출하기"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => {
            const isSoldOut = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 2;

            const isSelected = cart.some((item) => item.id === product.id);

            return (
              <div
                key={product.id}
                className={`rounded-2xl bg-white p-5 shadow-sm border ${
                  isSoldOut ? "opacity-60" : ""
                }`}
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>

                <div className="mb-2">
                  {isSoldOut ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                      🔴 품절
                    </span>
                  ) : isLowStock ? (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                      🟡 재고 얼마 안 남음
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      🟢 선택 가능
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-black">
                  {product.name}
                </h2>
                <p className="mt-1 text-gray-600">{product.description}</p>

                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>재고: {product.stock}개</span>
                  <span>{product.cost} point</span>
                </div>

                <button
                  disabled={isSoldOut || isSelected}
                  onClick={() => {
                    if (remainingPoints - product.cost < 0) {
                      alert("포인트가 부족합니다.");
                      return;
                    }

                    setCart([
                      ...cart,
                      {
                        ...product,
                        quantity: 1,
                      },
                    ]);
                  }}
                  className={`mt-4 w-full rounded-xl px-4 py-3 font-semibold ${
                    isSoldOut
                      ? "bg-gray-200 text-gray-500"
                      : isSelected
                        ? "bg-green-100 text-green-700"
                        : "bg-black text-white hover:bg-gray-800"
                  } disabled:cursor-not-allowed`}
                >
                  {isSoldOut ? "품절" : isSelected ? "✅ 선택됨" : "선택하기"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
