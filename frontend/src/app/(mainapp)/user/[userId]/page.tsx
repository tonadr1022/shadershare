import UserPage from "./_components/UserPage";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [];
}

export default function Home() {
  return <UserPage />;
}
