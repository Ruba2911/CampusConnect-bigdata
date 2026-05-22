import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import { RegistrationsProvider } from "@/contexts/RegistrationsContext";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import NotificationsPage from "./pages/NotificationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CreatePostPage from "./pages/CreatePostPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import PlacementsPage from "./pages/PlacementsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminStudentAnalyticsPage from "./pages/AdminStudentAnalyticsPage";
import AdminClubAnalyticsPage from "./pages/AdminClubAnalyticsPage";
import AdminDaAnalyticsPage from "./pages/AdminDaAnalyticsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => (
  <div className="flex min-h-screen w-full">
    <AppSidebar />
    <main className="ml-64 flex-1 p-6">
      <Outlet />
    </main>
  </div>
);

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useRole();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const HomeRoute = () => {
  const { role } = useRole();
  if (role === "super-admin") return <Navigate to="/admin" replace />;
  return role === "club-admin" || role === "da-officer" ? <Navigate to="/profile" replace /> : <Index />;
};

const router = createBrowserRouter(
  [
    { path: "/login", element: <LoginPage /> },
    {
      path: "/",
      element: <RequireAuth><AppLayout /></RequireAuth>,
      children: [
        { index: true, element: <HomeRoute /> },
        { path: "admin", element: <AdminDashboardPage /> },
        { path: "admin/students", element: <AdminStudentAnalyticsPage /> },
        { path: "admin/clubs", element: <AdminClubAnalyticsPage /> },
        { path: "admin/da", element: <AdminDaAnalyticsPage /> },
        { path: "profile", element: <ProfilePage /> },
        { path: "notifications", element: <NotificationsPage /> },
        { path: "analytics", element: <AnalyticsPage /> },
        { path: "create", element: <CreatePostPage /> },
        { path: "registrations", element: <RegistrationsPage /> },
        { path: "placements", element: <PlacementsPage /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoleProvider>
        <RegistrationsProvider>
          <RouterProvider router={router} />
        </RegistrationsProvider>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
