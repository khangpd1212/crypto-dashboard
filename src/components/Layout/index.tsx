import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Layout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex relative">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 flex-col gap-6 px-5 py-7 bg-white/95 dark:bg-[#0a1228] border-r border-[rgba(15,23,42,0.08)] dark:border-white/10 shadow-[inset_-1px_0_0_rgba(15,23,42,0.08)] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.02)] overflow-y-auto">
        <div className="flex items-center gap-3.5 py-2">
          <div className="w-12 h-12 rounded-[1.25rem] grid place-items-center bg-(--accent) text-white text-2xl shadow-[0_8px_24px_rgba(79,93,255,0.18)] border border-(--accent-border)">
            ⚡
          </div>
          <div className="min-w-0">
            <span className="block text-[0.72rem] uppercase tracking-[0.24em] text-(--text-muted) font-semibold mb-0.5">
              {t("app.brand") || "StakeNet"}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">{t("app.title")}</h1>
          </div>
        </div>

        <nav className="grid gap-2">
          {[
            { path: "/", icon: "📊", label: t("dashboard.title") },
            { path: "/settings", icon: "⚙️", label: t("settings.title") },
          ].map(({ path, icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `w-full text-left px-4 py-3 rounded-2xl border transition duration-200 flex items-center gap-3 text-sm font-medium ${
                  isActive
                    ? "bg-(--accent) border-(--accent-border) text-white shadow-[0_8px_24px_rgba(79,93,255,0.15)]"
                    : "bg-white/90 dark:bg-white/5 border-[rgba(15,23,42,0.08)] dark:border-white/5 text-(--text) hover:bg-[rgba(79,93,255,0.12)] hover:border-(--accent-border) dark:hover:bg-[rgba(255,255,255,0.12)]"
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.75)] dark:bg-[rgba(79,93,255,0.08)] px-4 py-3 text-center text-sm font-medium tracking-[0.03em] text-(--text) dark:text-white">
          {t("app.status") || "Live market feed"}
        </div>
      </aside>

      <div className="flex-1 md:ml-72 min-h-screen">
        <main className="pt-6 px-4 pb-10 md:px-10 flex flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}