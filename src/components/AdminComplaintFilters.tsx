"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Complaint = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string | Date;
  overdue?: boolean;
  resident?: {
    name: string;
    email?: string;
  };
};

export default function AdminComplaintFilters({
  complaints,
}: {
  complaints: Complaint[];
}) {
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (category !== "ALL" && c.category !== category) {
        return false;
      }

      if (status !== "ALL" && c.status !== status) {
        return false;
      }

      const created = new Date(c.createdAt);

      if (fromDate) {
        const from = new Date(`${fromDate}T00:00:00`);
        if (created < from) return false;
      }

      if (toDate) {
        const to = new Date(`${toDate}T23:59:59`);
        if (created > to) return false;
      }

      return true;
    });
  }, [complaints, category, status, fromDate, toDate]);

  function clearFilters() {
    setCategory("ALL");
    setStatus("ALL");
    setFromDate("");
    setToDate("");
  }

  return (
    <section className="card" style={{ marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontWeight: 800 }}>All complaints</h2>
          <p style={{ color: "#687386", fontSize: 13 }}>
            Showing {filtered.length} of {complaints.length} complaints
          </p>
        </div>

        <button type="button" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <select
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="ALL">All categories</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="CLEANING">Cleaning</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="LIFT">Lift</option>
          <option value="WATER">Water</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <input
          className="input"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          aria-label="From date"
        />

        <input
          className="input"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          aria-label="To date"
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Complaint</th>
              <th>Resident</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <b>{c.title}</b>
                  {c.overdue && (
                    <div className="overdue">Overdue</div>
                  )}
                </td>

                <td>{c.resident?.name}</td>

                <td>{c.category}</td>

                <td>
                  <span className={`pill ${c.priority}`}>
                    {c.priority}
                  </span>
                </td>

                <td>
                  <span className={`pill ${c.status}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </td>

                <td>
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>

                <td>
                  <Link
                    style={{
                      color: "#2563eb",
                      fontWeight: 650,
                    }}
                    href={`/complaints/${c.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <p style={{ color: "#687386", padding: 16 }}>
            No complaints match the selected filters.
          </p>
        )}
      </div>
    </section>
  );
}