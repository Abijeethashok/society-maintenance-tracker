import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isOverdue } from "@/lib/overdue";
import AdminComplaintFilters from "@/components/AdminComplaintFilters";

export default async function Admin() {
  const u = await requireUser();

  if (u.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const x = await prisma.complaint.findMany({
    include: {
      resident: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const countStatus = (status: string) =>
    x.filter((complaint) => complaint.status === status).length;

  const overdueCount = x.filter((complaint) =>
    isOverdue(complaint.createdAt, complaint.status)
  ).length;

  const categories = Object.entries(
    x.reduce((acc: Record<string, number>, complaint) => {
      acc[complaint.category] =
        (acc[complaint.category] || 0) + 1;

      return acc;
    }, {})
  );

  const complaintsForFilter = x.map((complaint) => ({
    ...complaint,
    createdAt: complaint.createdAt.toISOString(),
    overdue: isOverdue(
      complaint.createdAt,
      complaint.status
    ),
  }));

  return (
    <main className="bg">
      <div className="shell">

        <h1 style={{ fontSize: 30, fontWeight: 850 }}>
          Operations dashboard
        </h1>

        <p
          style={{
            color: "#687386",
            marginBottom: 20,
          }}
        >
          A clear view of what needs attention today.
        </p>

        {/* Dashboard statistics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(140px,1fr))",
            gap: 12,
          }}
        >
          {[
            ["Total", x.length],
            ["Open", countStatus("OPEN")],
            ["In Progress", countStatus("IN_PROGRESS")],
            ["Resolved", countStatus("RESOLVED")],
            ["Overdue", overdueCount],
            [
              "High Priority",
              x.filter(
                (complaint) =>
                  complaint.priority === "HIGH"
              ).length,
            ],
          ].map(([label, value]) => (
            <div className="card" key={String(label)}>
              <div
                style={{
                  color: "#687386",
                  fontSize: 13,
                }}
              >
                {label}
              </div>

              <div className="stat">
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Category statistics */}
        <section
          className="card"
          style={{ marginTop: 20 }}
        >
          <h2
            style={{
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            By category
          </h2>

          {categories.map(([category, count]) => (
            <div
              key={category}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "7px 0",
                borderBottom:
                  "1px solid #edf0f4",
              }}
            >
              <span>{category}</span>
              <b>{String(count)}</b>
            </div>
          ))}
        </section>

        {/* Complaint filtering */}
        <AdminComplaintFilters
          complaints={complaintsForFilter}
        />

      </div>
    </main>
  );
}