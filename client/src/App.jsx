import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ArchivedPage from "./pages/ArchivedPage";
import "./App.css";

function pageTitle(pathname) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/archived")) return "Archived";
  if (pathname.startsWith("/login")) return "Login";
  if (pathname.startsWith("/register")) return "Register";
  return "App";
}

function AuthLayout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="header-title">{pageTitle(location.pathname)}</div>
        <nav className="header-nav">
          <NavLink
            to="/login"
            className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
          >
            Register
          </NavLink>
        </nav>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="header-title">{pageTitle(location.pathname)}</div>
        <nav className="header-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/archived"
            className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
          >
            Archived
          </NavLink>
          <button type="button" onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/archived" element={<ArchivedPage />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
