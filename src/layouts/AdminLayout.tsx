import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminLayout = () => {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;