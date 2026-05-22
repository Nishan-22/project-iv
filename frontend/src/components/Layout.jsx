import { Link, Outlet } from "react-router-dom";
import { btnNav } from "../lib/ui.js";
import { useAuth } from "../context/AuthContext.jsx";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800/50 bg-slate-900 px-4 py-3.5 shadow-lg sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display text-lg font-bold text-white no-underline"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
            IT
          </span>
          Club Voting
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:inline">
              {user.first_name || user.username}
              {user.student_id ? ` · ${user.student_id}` : ""}
            </span>
            <button type="button" className={btnNav} onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
