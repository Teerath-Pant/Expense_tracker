import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./Components/AuthContext";
import FrontPage from "./Components/Front_page";
import Navbar from "./Components/Navbar";
import Button from "./Components/Button";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Logout from "./Pages/Logout";
import ExpenseDashboard from "./Pages/ExpenseDashboard";
import bgImage from "./assets/images/bgimage.jpg";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Redirect authenticated users away from auth pages
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard/transactions" replace />;
  }
  return children;
}

function MainLayout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      {/* Fixed Background Image and Overlays */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className={`flex flex-1 flex-col justify-start ${isDashboard ? "px-3 py-6 md:px-6 lg:px-8" : "px-4 py-8 sm:px-10 lg:px-20"}`}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <FrontPage />
                  <Button />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route path="/logout" element={<Logout />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/transactions" replace />} />
            <Route
              path="/dashboard/:tab"
              element={
                <ProtectedRoute>
                  <ExpenseDashboard />
                </ProtectedRoute>
              }
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
