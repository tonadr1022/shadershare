import { Separator } from "@/components/ui/separator";
import { UsersSidebar } from "./_components/UsersSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function UserPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold pb-4">Account</h1>
      <Separator />
      <SidebarProvider className="flex flex-row min-h-full max-h-full">
        <UsersSidebar />
        <main className="h-full w-full">{children}</main>
      </SidebarProvider>
    </div>
  );
}
