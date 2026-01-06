"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseForm_1 = require("./BaseForm");
var BaseCreatePage = function (_a) {
    var resource = _a.resource, fields = _a.fields;
    var initialValues = fields.reduce(function (acc, field) {
        acc[field.key] = "";
        return acc;
    }, {});
    return (<BaseForm_1.default initialValues={initialValues} resource={resource} fields={fields} mode="create"/>);
};
exports.default = BaseCreatePage;
