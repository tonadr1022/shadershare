"use client";
import { Separator } from "@/components/ui/separator";
import { UsersSidebar } from "./_components/UsersSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useGetMeRedirect } from "@/hooks/hooks";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

export default function UserPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data, isPending } = useGetMeRedirect();
  if (!isPending && !data) {
    router.push("/login");
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold pb-4">Account</h1>
      <Separator />
      <SidebarProvider className="flex flex-col sm:flex-row min-h-full max-h-full">
        <UsersSidebar />
        {isPending && (
          <main className="h-full w-full p-4">
            <Spinner />
          </main>
        )}
        {!isPending && !data && <p>Unable to load page.</p>}
        {data && <main className="h-full w-full p-4">{children}</main>}
      </SidebarProvider>
    </div>
  );
}
