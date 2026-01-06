"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@mantine/core/styles.css");
require("@mantine/dates/styles.css");
require("mantine-react-table/styles.css");
var core_1 = require("@mantine/core");
var modals_1 = require("@mantine/modals");
var react_router_1 = require("@refinedev/react-router");
var react_router_dom_1 = require("react-router-dom");
var core_2 = require("@refinedev/core");
var mantine_1 = require("@refinedev/mantine");
var Layout_1 = require("./components/Layout");
var dataProvider_1 = require("./dataProvider");
var resources_1 = require("./resources");
var createRoutes_1 = require("./utils/createRoutes");
var myTheme = (0, core_1.createTheme)({
    primaryColor: "teal",
    defaultRadius: "sm",
});
var App = function () {
    var apiUrl = "/api";
    return (<core_1.MantineProvider theme={myTheme} defaultColorScheme="light">
      <modals_1.ModalsProvider>
        <react_router_dom_1.BrowserRouter>
          <core_2.Refine dataProvider={(0, dataProvider_1.dataProvider)(apiUrl)} routerProvider={react_router_1.default} notificationProvider={mantine_1.useNotificationProvider} options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
        }} resources={(0, resources_1.getRefineResources)()}>
            <react_router_dom_1.Routes>
              <react_router_dom_1.Route path="/cp" element={<Layout_1.default />}>
                <react_router_dom_1.Route path="" element={<react_router_dom_1.Navigate to="users" replace/>}/>
                {...(0, createRoutes_1.createRoutes)((0, resources_1.getAllRoutes)())}
              </react_router_dom_1.Route>
            </react_router_dom_1.Routes>
          </core_2.Refine>
        </react_router_dom_1.BrowserRouter>
      </modals_1.ModalsProvider>
    </core_1.MantineProvider>);
};
exports.default = App;
