import { AppShell, Group, Text, NavLink } from "@mantine/core";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { getNavigationItems } from "../resources";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavigationItems();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Text size="lg" fw={700}>
            KotoAdmin
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            label={item.label}
            active={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;
