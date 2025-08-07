"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { refreshSession } from "@/lib/auth-client";

export function SessionRefreshHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleRefresh = async () => {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("refresh");

      const success = await refreshSession();

      if (success) {
        router.replace(newUrl.pathname + newUrl.search);
      } else {
        router.replace("/new-subscription");
      }
    };

    handleRefresh();
  }, [router]);

  return null;
}
