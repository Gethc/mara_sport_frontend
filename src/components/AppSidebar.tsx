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
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  User, 
  Trophy, 
  CreditCard, 
  Bell,
  Medal
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Profile Management", url: "/dashboard/profile", icon: User },
  { title: "Sports Registration", url: "/dashboard/sports-registration", icon: Trophy },
  { title: "Payments & Sponsorship", url: "/dashboard/student-payments", icon: CreditCard },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];

export function AppSidebar() {
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
            <Medal className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Sports Portal</h2>
            <p className="text-xs text-muted-foreground">Student Dashboard</p>
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