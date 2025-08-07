"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient, refreshSession } from "@/lib/auth-client";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const session = authClient.useSession();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (session.data?.user && !session.data.user.plan && !isChecking) {
        setIsChecking(true);

        const refreshed = await refreshSession();

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!refreshed || !session.data?.user?.plan) {
          router.push("/new-subscription");
        } else {
          setIsChecking(false);
        }
      }
    };

    checkSubscription();
  }, [session.data?.user?.plan, router, isChecking, session.data?.user]);

  if (session.isPending || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Verificando assinatura...</p>
        </div>
      </div>
    );
  }

  if (session.data?.user && !session.data.user.plan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
