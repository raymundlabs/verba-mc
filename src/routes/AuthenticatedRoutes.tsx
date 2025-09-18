import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import Appointments from "@/pages/Appointments";
import Calendar from "@/pages/Calendar";
import FollowUps from "@/pages/FollowUps";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import UserManagement from "@/pages/UserManagement";

export const AuthenticatedRoutes = () => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route
        path="/"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/leads"
        element={
          <Layout>
            <Leads />
          </Layout>
        }
      />
      <Route
        path="/appointments"
        element={
          <Layout>
            <Appointments />
          </Layout>
        }
      />
      <Route
        path="/calendar"
        element={
          <Layout>
            <Calendar />
          </Layout>
        }
      />
      <Route
        path="/followups"
        element={
          <Layout>
            <FollowUps />
          </Layout>
        }
      />
      <Route
        path="/settings"
        element={<RoleProtectedRoute required="manager" redirectTo="/profile" />}
      >
        <Route
          index
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
      </Route>
      <Route
        path="/profile"
        element={
          <Layout>
            <Profile />
          </Layout>
        }
      />
      <Route
        path="/users"
        element={<RoleProtectedRoute required="manager" redirectTo="/profile" />}
      >
        <Route
          index
          element={
            <Layout>
              <UserManagement />
            </Layout>
          }
        />
      </Route>
    </Route>
  </Routes>
);
