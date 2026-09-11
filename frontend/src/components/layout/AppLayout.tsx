import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <Sidebar />

      <main className="ml-[272px] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}