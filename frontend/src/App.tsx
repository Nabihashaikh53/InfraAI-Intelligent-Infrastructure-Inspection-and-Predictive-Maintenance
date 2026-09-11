import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import NewInspection from "./pages/NewInspection";
import Detection from "./pages/Detection";
import Analysis from "./pages/Analysis";
import AssetDetail from "./pages/AssetDetail";
import Maintenance from "./pages/Maintenance";
import ReportView from "./pages/ReportView";
import Inspections from "./pages/Inspections";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/assets/:id" element={<AssetDetail />} />

            <Route path="/inspection/new" element={<NewInspection />} />
            <Route
              path="/inspection/detect/:id"
              element={<Detection />}
            />
            <Route
              path="/inspection/analysis/:id"
              element={<Analysis />}
            />

            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/reports" element={<Reports />} />
            <Route
              path="/reports/:inspectionId"
              element={<ReportView />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}