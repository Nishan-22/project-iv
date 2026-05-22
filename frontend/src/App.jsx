import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingScreen } from "./components/LoadingScreen.jsx";
import { Layout } from "./components/Layout.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ResultsPage } from "./pages/ResultsPage.jsx";
import { VotePage } from "./pages/VotePage.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen message="Loading…" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vote/:electionId" element={<VotePage />} />
          <Route path="/results/:electionId" element={<ResultsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
