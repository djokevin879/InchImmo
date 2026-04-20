"use client";

import { 
  LayoutDashboard, 
  UserCheck, 
  Building2, 
  Home, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  Activity,
  Sparkles
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminItems = [
  { title: "Tableau de bord", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Propriétaires", url: "/admin/proprietaires", icon: UserCheck },
  { title: "Résidences", url: "/admin/residences", icon: Building2 },
  { title: "Appartements", url: "/admin/appartements", icon: Home },
  { title: "Locataires", url: "/admin/locataires", icon: Users },
  { title: "Paiements", url: "/admin/paiements", icon: CreditCard },
  { title: "Rapports IA", url: "/admin/rapports", icon: Sparkles },
  { title: "Journal d'activité", url: "/admin/activites", icon: Activity },
  { title: "Utilisateurs", url: "/admin/utilisateurs", icon: Settings },
];

const agentItems = [
  { title: "Mon Espace Agent", url: "/agent/dashboard", icon: LayoutDashboard },
  { title: "Paiements", url: "/agent/paiements", icon: CreditCard },
  { title: "Rapports", url: "/agent/rapports", icon: Sparkles },
];

const comptableItems = [
  { title: "Paiements", url: "/admin/paiements", icon: CreditCard },
  { title: "Rapports", url: "/admin/rapports", icon: Sparkles },
];

export function AppSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const items = role === "ADMIN" 
    ? adminItems 
    : role === "AGENT" 
      ? agentItems 
      : role === "COMPTABLE" 
        ? comptableItems 
        : [];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="logo-icon-bg">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold text-white tracking-tight uppercase">INCH'ALLAH</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={pathname === item.url}
                    className={pathname === item.url ? "sidebar-active-item" : "opacity-70 hover:opacity-100 hover:bg-white/5"}
                    render={
                      <Link href={item.url} className="flex items-center w-full px-4">
                        <item.icon className="mr-3" />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => signOut()}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
