import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "▦",
  },
  {
    path: "/assets",
    label: "Assets",
    icon: "▣",
  },
  {
    path: "/inspections",
    label: "Inspections",
    icon: "◫",
  },
  {
    path: "/maintenance",
    label: "Maintenance",
    icon: "⌁",
  },
  {
    path: "/reports",
    label: "Reports",
    icon: "▤",
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside
      style={{
        width: 272,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        background: "#142b43",
        color: "#d9e2e9",
        borderRight: "1px solid #294159",
      }}
    >
      {/* Brand */}
      <div
        style={{
          height: 78,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxSizing: "border-box",
          borderBottom: "1px solid #294159",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "#f9b52f",
            color: "#142b43",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          ◎
        </div>

        <div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.3px",
            }}
          >
            InfraAI
          </div>

          <div
            style={{
              marginTop: 5,
              color: "#7890a6",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "1.5px",
              lineHeight: 1.3,
            }}
          >
            INFRASTRUCTURE
            <br />
            INTELLIGENCE
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div
        style={{
          padding: "18px 16px 16px",
          borderBottom: "1px solid #294159",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              color: "#6f879d",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "1.5px",
            }}
          >
            WORKSPACE
          </span>

          <span
            style={{
              color: "#7890a6",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            MUM / 07
          </span>
        </div>

        <div
          style={{
            minHeight: 64,
            borderRadius: 9,
            background: "#203d59",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: "#2b4d6a",
              color: "#f9b52f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ▣
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Mumbai Civic Works
            </div>

            <div
              style={{
                color: "#7890a6",
                fontSize: 10,
                marginTop: 3,
              }}
            >
              Authority workspace
            </div>
          </div>

          <span style={{ color: "#9eb0bf", fontSize: 15 }}>⌄</span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 12px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            color: "#6f879d",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "1.5px",
            padding: "0 12px 9px",
          }}
        >
          CONTROL ROOM
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                minHeight: 48,
                padding: "0 12px",
                borderRadius: 9,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 13,
                textDecoration: "none",
                color: isActive ? "#172b44" : "#b8c6d2",
                background: isActive ? "#f9b52f" : "transparent",
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                transition: "all 150ms ease",
              })}
            >
              <span
                style={{
                  width: 22,
                  textAlign: "center",
                  fontSize: 17,
                  lineHeight: 1,
                }}
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div
          style={{
            color: "#6f879d",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "1.5px",
            padding: "24px 12px 9px",
          }}
        >
          EVIDENCE & OUTPUT
        </div>

        <NavLink
          to="/reports"
          style={({ isActive }) => ({
            minHeight: 48,
            padding: "0 12px",
            borderRadius: 9,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 13,
            textDecoration: "none",
            color: isActive ? "#172b44" : "#b8c6d2",
            background: isActive ? "#f9b52f" : "transparent",
            fontSize: 14,
            fontWeight: isActive ? 700 : 500,
          })}
        >
          <span
            style={{
              width: 22,
              textAlign: "center",
              fontSize: 17,
            }}
          >
            ▤
          </span>

          <span>Reports</span>
        </NavLink>
      </nav>

      {/* Bottom actions */}
      <div
        style={{
          borderTop: "1px solid #294159",
          padding: "10px 12px 0",
        }}
      >
        <div
          style={{
            minHeight: 45,
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            gap: 13,
            color: "#b8c6d2",
            fontSize: 14,
          }}
        >
          <span
            style={{
              width: 22,
              textAlign: "center",
              fontSize: 17,
            }}
          >
            ♧
          </span>

          <span style={{ flex: 1 }}>Notifications</span>

          <span
            style={{
              minWidth: 21,
              height: 21,
              padding: "0 5px",
              borderRadius: 11,
              background: "#ef7358",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 800,
              boxSizing: "border-box",
            }}
          >
            3
          </span>
        </div>

        <div
          style={{
            minHeight: 45,
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            gap: 13,
            color: "#b8c6d2",
            fontSize: 14,
          }}
        >
          <span
            style={{
              width: 22,
              textAlign: "center",
              fontSize: 17,
            }}
          >
            ⚙
          </span>

          <span>Settings</span>
        </div>

        {/* User */}
        <div
          style={{
            borderTop: "1px solid #294159",
            marginTop: 4,
            padding: "12px 8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#d5e9e8",
              color: "#286d70",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {user?.name
              ? user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "IN"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "Inspector"}
            </div>

            <div
              style={{
                color: "#7890a6",
                fontSize: 9,
                marginTop: 2,
                textTransform: "capitalize",
              }}
            >
              {user?.role || "Inspector"}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Log out"
            style={{
              border: "none",
              background: "transparent",
              color: "#8da1b2",
              cursor: "pointer",
              fontSize: 17,
              padding: 4,
            }}
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}