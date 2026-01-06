"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@mantine/core");
var react_router_dom_1 = require("react-router-dom");
var resources_1 = require("../resources");
var Layout = function () {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var location = (0, react_router_dom_1.useLocation)();
    var navItems = (0, resources_1.getNavigationItems)();
    return (<core_1.AppShell header={{ height: 60 }} navbar={{ width: 250, breakpoint: "sm" }} padding="md">
      <core_1.AppShell.Header>
        <core_1.Group h="100%" px="md">
          <core_1.Text size="lg" fw={700}>
            KotoAdmin
          </core_1.Text>
        </core_1.Group>
      </core_1.AppShell.Header>

      <core_1.AppShell.Navbar p="md">
        {navItems.map(function (item) { return (<core_1.NavLink key={item.name} label={item.label} active={location.pathname.startsWith(item.path)} onClick={function () { return navigate(item.path); }}/>); })}
      </core_1.AppShell.Navbar>

      <core_1.AppShell.Main>
        <react_router_dom_1.Outlet />
      </core_1.AppShell.Main>
    </core_1.AppShell>);
};
exports.default = Layout;
