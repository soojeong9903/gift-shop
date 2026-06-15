import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_name,
      contact_type,
      contact_value,
      note,
      total_cost,
      created_at,
      order_items (
        id,
        product_name,
        quantity,
        cost
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-500">
          주문을 불러오지 못했습니다: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pink-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-black">📦 주문 관리</h1>

        <AdminLogoutButton />
      </div>
      <div className="grid gap-4">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">
                {order.customer_name}
              </h2>
              <span className="text-sm text-gray-500">
                {order.total_cost}pt
              </span>
            </div>

            <p className="text-gray-700">
              연락처: {order.contact_type} / {order.contact_value}
            </p>

            {order.note && (
              <p className="mt-1 text-gray-700">메모: {order.note}</p>
            )}

            <ul className="mt-4 space-y-2">
              {order.order_items?.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between rounded-xl bg-gray-50 px-4 py-2 text-black"
                >
                  <span>{item.product_name}</span>
                  <span>
                    x{item.quantity} / {item.cost}pt
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
