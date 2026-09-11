import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/assets", label: "Assets" },
  { path: "/inspections", label: "Inspections" },
  { path: "/maintenance", label: "Maintenance" },
  { path: "/reports", label: "Reports" },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        borderRight: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        padding: "24px 16px",
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 15, marginBottom: 32 }}>
        InfraAI
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              padding: "8px 12px",
              borderRadius: 4,
              fontSize: 14,
              color: isActive ? "var(--color-accent)" : "var(--color-ink-muted)",
              background: isActive ? "#EAF1F5" : "transparent",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
