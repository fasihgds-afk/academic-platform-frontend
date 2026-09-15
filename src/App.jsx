import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import StaffPage from "./pages/StaffPage";
import StudentsPage from "./pages/StudentsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import PriceCalculatorPage from "./pages/PriceCalculatorPage";
import RouteConfigPage from "./pages/RouteConfigPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />

              <Route element={<ProtectedRoute roles={["admin", "salesAgent"]} />}>
                <Route path="students" element={<StudentsPage />} />
                <Route path="students/:userId" element={<StudentDetailPage />} />
                <Route path="price-calculator" element={<PriceCalculatorPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={["admin"]} />}>
                <Route path="staff" element={<StaffPage />} />
                <Route path="route-configs" element={<RouteConfigPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
