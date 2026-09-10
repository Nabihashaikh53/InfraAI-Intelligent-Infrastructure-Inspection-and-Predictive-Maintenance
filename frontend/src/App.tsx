import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import NewInspection from "./pages/NewInspection";
import Detection from "./pages/Detection";
import Analysis from "./pages/Analysis";
import AssetDetail from "./pages/AssetDetail";
import Maintenance from "./pages/Maintenance";
import ReportView from "./pages/ReportView";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/inspection/new" element={<NewInspection />} />

            <Route
              path="/inspection/detect/:id"
              element={<Detection />}
            />

            <Route
              path="/inspection/analysis/:id"
              element={<Analysis />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
          
          <Route
            path="/assets/:id"
            element={<AssetDetail />}
          />
          
          <Route
           path="/maintenance"
           element={<Maintenance />}
          />

          <Route
           path="/reports/:inspectionId"
           element={<ReportView />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}