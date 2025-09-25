import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { InstitutionSidebar } from "@/components/InstitutionSidebar";
import { InstitutionHeader } from "@/components/InstitutionHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const InstitutionLayout = () => {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <InstitutionSidebar />
        <SidebarInset>
          <InstitutionHeader />
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default InstitutionLayout;