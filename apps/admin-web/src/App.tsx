import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Refine, useIsAuthenticated } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/mantine";
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { dataProvider } from "@/providers/dataProvider";
import { resourceStore } from "@/resources";
import { createAuthProvider } from "@/providers/authProvider";
import DashboardPage from "@/pages/DashboardPage";

const myTheme = createTheme({
  primaryColor: "teal",
  defaultRadius: "sm",
});

const App = () => {
  const apiUrl = `/api`;

  return (
    <MantineProvider theme={myTheme} defaultColorScheme="light">
      <ModalsProvider>
        <BrowserRouter>
          <Refine
            dataProvider={dataProvider(apiUrl)}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            authProvider={createAuthProvider(apiUrl)}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/cp/*"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="" element={<DashboardPage />} />
                {resourceStore.getRoutes()}
              </Route>
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Refine>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  );
};

// Component to handle root path redirection based on auth status
const RootRedirect = () => {
  const { data: isAuthenticated } = useIsAuthenticated();

  if (isAuthenticated?.authenticated) {
    return <Navigate to="/cp" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default App;
