import ViewPage from "./_components/ViewPage";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [];
}

export default function Home() {
  return <ViewPage />;
}
