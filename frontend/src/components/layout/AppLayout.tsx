import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div>
      <Sidebar />
      <main style={{ marginLeft: 220, padding: "32px 40px", minHeight: "100vh" }}>
        <Outlet />
      </main>
    </div>
  );
}