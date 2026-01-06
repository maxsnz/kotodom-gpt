"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = void 0;
var react_router_dom_1 = require("react-router-dom");
var BaseListPage_1 = require("../components/BaseListPage");
var BaseShowPage_1 = require("../components/BaseShowPage");
var BaseEditPage_1 = require("../components/BaseEditPage");
var BaseCreatePage_1 = require("../components/BaseCreatePage");
var createRoutes = function (config) {
    var resources = Array.isArray(config) ? config : [config];
    return resources.flatMap(function (_a) {
        var name = _a.name, fields = _a.fields;
        return [
            <react_router_dom_1.Route key={"".concat(name, "-list")} path={name} element={<BaseListPage_1.default resource={name} fields={fields}/>}/>,
            <react_router_dom_1.Route key={"".concat(name, "-create")} path={"".concat(name, "/create")} element={<BaseCreatePage_1.default resource={name} fields={fields}/>}/>,
            <react_router_dom_1.Route key={"".concat(name, "-edit")} path={"".concat(name, "/edit/:id")} element={<BaseEditPage_1.default resource={name} fields={fields}/>}/>,
            <react_router_dom_1.Route key={"".concat(name, "-show")} path={"".concat(name, "/:id")} element={<BaseShowPage_1.default resource={name} fields={fields}/>}/>,
        ];
    });
};
exports.createRoutes = createRoutes;
