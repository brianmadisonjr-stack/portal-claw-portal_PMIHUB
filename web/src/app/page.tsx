import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>PM Intelligence Hub</h1>
      <p style={{ marginTop: 8 }}>Portal</p>
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign up</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </main>
  );
}
