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
import { config } from "./config";

const myTheme = createTheme({
  primaryColor: "teal",
  defaultRadius: "sm",
});

const App = () => {
  return (
    <MantineProvider theme={myTheme} defaultColorScheme="light">
      <ModalsProvider>
        <BrowserRouter>
          <Refine
            dataProvider={dataProvider(config.apiUrl)}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            authProvider={createAuthProvider(config.apiUrl)}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route path={config.basePath}>
                <Route path="login" element={<LoginPage />} />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<DashboardPage />} />
                  {resourceStore.getRoutes()}
                </Route>
                <Route path="" element={<RootRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
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
    return <Navigate to={`${config.basePath}/dashboard`} replace />;
  }

  return <Navigate to={`${config.basePath}/login`} replace />;
};

export default App;
