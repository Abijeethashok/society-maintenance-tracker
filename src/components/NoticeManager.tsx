"use client";

import { useEffect, useState } from "react";

export default function NoticeManager() {
  const [x, setX] = useState<any[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    const response = await fetch("/api/notices");
    const data = await response.json();
    setX(data.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const f = new FormData(form);

    setErr("");

    const r = await fetch("/api/admin/notices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: f.get("title"),
        content: f.get("content"),
        important: f.get("important") === "on",
      }),
    });

    if (!r.ok) {
      setErr((await r.json()).error.message);
    } else {
      form.reset();
      load();
    }
  }

  async function del(id: string) {
    if (confirm("Delete this notice?")) {
      await fetch(`/api/admin/notices/${id}`, {
        method: "DELETE",
      });

      load();
    }
  }

  return (
    <>
      <form
        className="card"
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <input
          className="input"
          name="title"
          placeholder="Notice title"
          required
        />

        <textarea
          className="textarea"
          name="content"
          placeholder="Message for residents"
          required
        />

        <label>
          <input
            name="important"
            type="checkbox"
          />{" "}
          Mark as important and email residents
        </label>

        {err && (
          <p style={{ color: "#dc2626" }}>
            {err}
          </p>
        )}

        <button className="btn">
          Publish notice
        </button>
      </form>

      <div style={{ marginTop: 18 }}>
        {x.map((n) => (
          <article
            className="card"
            style={{
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
            }}
            key={n.id}
          >
            <div>
              <b>{n.title}</b>

              {n.important && (
                <span
                  className="pill MEDIUM"
                  style={{ marginLeft: 8 }}
                >
                  IMPORTANT
                </span>
              )}

              <p
                style={{
                  color: "#687386",
                  marginTop: 5,
                }}
              >
                {n.content}
              </p>
            </div>

            <button
              onClick={() => del(n.id)}
              style={{ color: "#dc2626" }}
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </>
  );
}