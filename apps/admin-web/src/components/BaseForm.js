"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var mantine_1 = require("@refinedev/mantine");
var core_1 = require("@mantine/core");
var react_router_dom_1 = require("react-router-dom");
var useGeneralErrors_1 = require("../hooks/useGeneralErrors");
var GeneralErrors_1 = require("./GeneralErrors");
var BaseForm = function (_a) {
    var initialValues = _a.initialValues, fields = _a.fields, _b = _a.mode, mode = _b === void 0 ? "create" : _b, resource = _a.resource, id = _a.id;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _c = (0, mantine_1.useForm)({
        initialValues: initialValues,
        refineCoreProps: __assign({ resource: resource, action: mode, redirect: false, onMutationSuccess: function () {
                navigate("/admin/".concat(resource));
            } }, (mode === "edit" && id ? { id: id } : {})),
    }), getInputProps = _c.getInputProps, saveButtonProps = _c.saveButtonProps, formLoading = _c.refineCore.formLoading, errors = _c.errors;
    // Get field keys to check for general errors
    var fieldKeys = fields.map(function (f) { return f.key; });
    // Extract general errors (errors not associated with form fields)
    var generalErrors = (0, useGeneralErrors_1.useGeneralErrors)(errors, fieldKeys);
    var FormWrapper = mode === "edit" ? mantine_1.Edit : mantine_1.Create;
    return (<FormWrapper isLoading={formLoading} saveButtonProps={saveButtonProps} resource={resource}>
      {fields.map(function (field) {
            var inputProps = getInputProps(field.key);
            return (<core_1.TextInput key={field.key} mt="sm" label={field.label} {...inputProps} 
            // getInputProps should already include error, but we can override if needed
            error={inputProps.error || (errors === null || errors === void 0 ? void 0 : errors[field.key])}/>);
        })}

      <GeneralErrors_1.GeneralErrors errors={generalErrors}/>
    </FormWrapper>);
};
exports.default = BaseForm;
