"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
    </div>
  );
}
