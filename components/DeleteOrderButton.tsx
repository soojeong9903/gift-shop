"use client";

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const handleDelete = async () => {
    if (!confirm("삭제할까요?")) return;

    const res = await fetch("/api/admin/delete-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });

    if (res.ok) {
      location.reload();
    } else {
      alert("삭제 실패");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="rounded-xl bg-red-500 px-3 py-2 text-white"
    >
      삭제
    </button>
  );
}
