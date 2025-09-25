import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardLayout = () => {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;