"use client";

interface AdminPageProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminPage({ title, description, actions, children }: AdminPageProps) {
  return (
    <div className="admin-page">
      <div className="admin-page-head-row">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="admin-page-actions">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
