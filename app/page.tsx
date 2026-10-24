import { Site } from "@/components/site/app";
import { publicData } from "@/lib/server/public";
export const dynamic = "force-dynamic";
export default async function Home() {
  return <Site data={await publicData()} />;
}
