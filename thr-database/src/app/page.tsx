import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Treasure House Relics Database</h1>

      <p>Build and manage databases using Form and Table views.</p>

      <Link href="/dashboard">Open Dashboard</Link>
    </main>
  );
}
