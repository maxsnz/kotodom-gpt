import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Refine } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/mantine";
import Layout from "./components/Layout";
import { dataProvider } from "./dataProvider";
import { getRefineResources, getAllRoutes } from "./resources";
import { createRoutes } from "./utils/createRoutes";

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
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
            resources={getRefineResources()}
          >
            <Routes>
              <Route path="/cp" element={<Layout />}>
                <Route path="" element={<Navigate to="users" replace />} />
                {...createRoutes(getAllRoutes())}
              </Route>
            </Routes>
          </Refine>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default App;
