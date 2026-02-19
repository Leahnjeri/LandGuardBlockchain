// src/App.jsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import NewOwnerAcceptTransfer from "./pages/NewOwnerAcceptTransfer";
import Resources from "./pages/Resources";
import AdvocateLayout from "./pages/advocates/AdvocateLayout";
import AdminGate from "./routes/AdminGate";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-owner-accept-transfer" element={<NewOwnerAcceptTransfer />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/advocate" element={<AdvocateLayout />} />

        {/* ✅ Protect admin route */}
        <Route element={<AdminGate />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
