import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SubscriptionGuard } from "@/components/subscription-guard";

import { AppSidebar } from "./_components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <SubscriptionGuard>{children}</SubscriptionGuard>
      </main>
    </SidebarProvider>
  );
}
