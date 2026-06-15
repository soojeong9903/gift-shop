import { supabase } from "@/lib/supabase";
import GiftShop from "@/components/GiftShop";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <main className="p-8">상품을 불러오지 못했습니다.: {error.message}</main>
    );
  }

  return <GiftShop products={products ?? []} />;
}
