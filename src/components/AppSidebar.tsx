import { Home, Bell, BarChart3, PlusCircle, UserCircle, Users, Briefcase, GraduationCap, Megaphone, ClipboardList, LogOut, LayoutDashboard, Building2 } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard, roles: ["super-admin"] },
  { title: "Student Analytics", path: "/admin/students", icon: GraduationCap, roles: ["super-admin"] },
  { title: "Club Analytics", path: "/admin/clubs", icon: Building2, roles: ["super-admin"] },
  { title: "DA Analytics", path: "/admin/da", icon: BarChart3, roles: ["super-admin"] },
  { title: "Feed", path: "/", icon: Home, roles: ["student"] },
  { title: "Profile", path: "/profile", icon: UserCircle, roles: ["club-admin", "da-officer"] },
  { title: "Placements", path: "/placements", icon: Briefcase, roles: ["student", "da-officer"] },
  { title: "Notifications", path: "/notifications", icon: Bell, roles: ["student"] },
  { title: "Create Post", path: "/create", icon: PlusCircle, roles: ["club-admin", "da-officer"] },
  { title: "Registrations", path: "/registrations", icon: ClipboardList, roles: ["club-admin", "da-officer"] },
  { title: "Analytics", path: "/analytics", icon: BarChart3, roles: ["club-admin", "da-officer"] },
];

export function AppSidebar() {
  const { role, userName, logout } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-primary">
          <Megaphone className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">CampusConnect</h1>
          <p className="text-xs text-muted-foreground">Student Hub</p>
        </div>
      </div>

      <div className="mb-6 px-2">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Logged in as</p>
        <div className="rounded-xl border border-border/60 bg-card p-3 text-sm text-foreground">
          <p className="font-medium">{role.replace("-", " ")}</p>
          <p className="text-xs text-muted-foreground">{userName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary glow-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
              {item.title === "Notifications" && (
                <span className="notification-pulse ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                  3
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="mt-auto rounded-xl glass p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs capitalize text-muted-foreground">{role.replace("-", " ")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
