import { AppShell, Group, Text, NavLink, Button } from "@mantine/core";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "@refinedev/core";
import { IconLogout } from "@tabler/icons-react";
import { getNavigationItems } from "@/utils/getNavigationItems";
import { resources } from "@/resources";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: logout } = useLogout();
  const navItems = getNavigationItems(resources);

  const handleLogout = () => {
    logout();
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text size="lg" fw={700}>
            KotoAdmin
          </Text>
          <Button
            variant="light"
            color="red"
            leftSection={<IconLogout size={16} />}
            onClick={handleLogout}
            size="sm"
          >
            Logout
          </Button>
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
