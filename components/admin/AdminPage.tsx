"use client";

interface AdminPageProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminPage({ title, description, actions, children }: AdminPageProps) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>{title}</h1>
          {description && <p style={{ color: "var(--text-2)", fontSize: 14 }}>{description}</p>}
        </div>
        {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
      </div>
      {children}
    </>
  );
}
