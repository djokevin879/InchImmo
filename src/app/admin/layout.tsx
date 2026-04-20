import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { RechercheGlobale } from "@/components/recherche-globale";
import { ClocheNotifications } from "@/components/cloche-notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "COMPTABLE")) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar role={session.user.role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6 bg-white sticky top-0 z-40">
          <SidebarTrigger />
          
          <div className="flex-1 max-w-xl hidden md:block">
            <RechercheGlobale />
          </div>

          <div className="flex flex-1 items-center justify-end gap-4 overflow-hidden">
            <h1 className="text-sm font-black text-secondary hidden lg:block uppercase tracking-widest truncate">
              Section {session.user.role === 'ADMIN' ? 'Administration' : 'Comptabilité'}
            </h1>
            <ClocheNotifications />
            <div className="flex items-center gap-3 bg-gray-50 border px-3 py-1.5 rounded-full shrink-0">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-black text-primary uppercase">
                {session.user.name?.[0] || 'U'}
              </div>
              <span className="text-xs font-black text-secondary uppercase tracking-wider hidden sm:block truncate max-w-[120px]">
                {session.user.name}
              </span>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
