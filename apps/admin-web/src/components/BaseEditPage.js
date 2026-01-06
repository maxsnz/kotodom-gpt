"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@refinedev/core");
var react_router_dom_1 = require("react-router-dom");
var BaseForm_1 = require("./BaseForm");
var BaseEditPage = function (_a) {
    var _b;
    var resource = _a.resource, fields = _a.fields;
    var id = (0, react_router_dom_1.useParams)().id;
    var query = (0, core_1.useOne)({
        resource: resource,
        id: id,
    }).query;
    if (query.isLoading) {
        return <div>Loading...</div>;
    }
    var user = (_b = query.data) === null || _b === void 0 ? void 0 : _b.data;
    var initialValues = fields.reduce(function (acc, field) {
        acc[field.key] = (user === null || user === void 0 ? void 0 : user[field.key]) || "";
        return acc;
    }, {});
    return (<BaseForm_1.default mode="edit" initialValues={initialValues} fields={fields} resource={resource} id={id}/>);
};
exports.default = BaseEditPage;
