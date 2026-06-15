"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
    >
      🚪 Logout
    </button>
  );
}
