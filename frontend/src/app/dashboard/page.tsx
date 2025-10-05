"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setHistory(data));
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-semibold mb-6">Historia komend</h1>
      <ul className="bg-white shadow rounded-lg divide-y">
        {history.map((cmd: any) => (
          <li key={cmd.id} className="p-4">
            <strong>{cmd.user}</strong>: {cmd.command}
          </li>
        ))}
      </ul>
    </div>
  );
}
