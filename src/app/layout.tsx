import "./globals.css";
import Link from "next/link";
import { session } from "@/lib/auth";

export const metadata = {
  title: "Society Maintenance Tracker",
  description: "Maintenance operations, made visible.",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await session();

  return (
    <html lang="en">
      <body>
        <header className="nav">
          <div
            className="shell"
            style={{
              paddingTop: 14,
              paddingBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Link
              href="/"
              style={{ fontWeight: 800, fontSize: 18 }}
            >
              Society<span style={{ color: "#2563eb" }}>Care</span>
            </Link>

            <nav
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                fontSize: 14,
              }}
            >
              {u && (
                <>
                  <Link
                    href={u.role === "ADMIN" ? "/admin" : "/dashboard"}
                  >
                    Dashboard
                  </Link>

                  <Link href="/complaints">Complaints</Link>

                  <Link href="/notices">Notices</Link>

                  {u.role === "ADMIN" && (
                    <Link href="/admin/notices">
                      Manage notices
                    </Link>
                  )}

                  <span style={{ color: "#687386" }}>
                    {u.name}
                  </span>
                </>
              )}

              {!u ? (
                <>
                  <Link href="/login">Login</Link>
                  <Link className="btn" href="/register">
                    Get started
                  </Link>
                </>
              ) : (
                <form action="/api/auth/logout" method="post">
                  <button>Logout</button>
                </form>
              )}
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}