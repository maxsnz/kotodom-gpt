import { createBrowserRouter, RouterProvider, Link, Outlet } from "react-router-dom";

import { FailedJobsPage } from "../features/jobs";

function Layout() {
  return (
    <div style={layoutStyles.container}>
      <nav style={layoutStyles.nav}>
        <div style={layoutStyles.logo}>Kotodom Admin</div>
        <ul style={layoutStyles.menu}>
          <li>
            <Link to="/" style={layoutStyles.link}>Dashboard</Link>
          </li>
          <li>
            <Link to="/jobs/failed" style={layoutStyles.link}>Failed Jobs</Link>
          </li>
        </ul>
      </nav>
      <main style={layoutStyles.main}>
        <Outlet />
      </main>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>Dashboard</h1>
      <p>Welcome to Kotodom Admin Panel</p>
      <div style={{ marginTop: "24px" }}>
        <Link
          to="/jobs/failed"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#e74c3c",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 500,
          }}
        >
          View Failed Jobs
        </Link>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "jobs/failed",
        element: <FailedJobsPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

const layoutStyles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    height: "64px",
    backgroundColor: "#1a1a2e",
    color: "white",
  },
  logo: {
    fontSize: "20px",
    fontWeight: 700,
    marginRight: "48px",
  },
  menu: {
    display: "flex",
    listStyle: "none",
    margin: 0,
    padding: 0,
    gap: "24px",
  },
  link: {
    color: "rgba(255,255,255,0.8)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    transition: "color 0.2s",
  },
  main: {
    minHeight: "calc(100vh - 64px)",
  },
};
