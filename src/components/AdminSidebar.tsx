import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  HandHeart,
  Trophy,
  Shield
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Institutions", url: "/admin/admin-institutions", icon: Building2 },
  { title: "Students", url: "/admin/admin-students", icon: Users },
  { title: "Payments", url: "/admin/admin-payments", icon: CreditCard },
  { title: "Invoices", url: "/admin/admin-invoices", icon: CreditCard },
  { title: "Sponsorships", url: "/admin/admin-sponsorships", icon: HandHeart },
  { title: "Sports Management", url: "/admin/admin-sports", icon: Trophy },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = (path: string) => 
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium shadow-soft" 
      : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Sports Portal</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}