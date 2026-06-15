import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { orderId } = await req.json();

  const { data: orderItems, error: readError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  const stockItems =
    orderItems?.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })) ?? [];

  if (stockItems.length > 0) {
    const { error: stockError } = await supabase.rpc("increase_product_stock", {
      items: stockItems,
    });

    if (stockError) {
      return NextResponse.json({ error: stockError.message }, { status: 500 });
    }
  }

  const { error: itemError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  const { error: orderError } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
