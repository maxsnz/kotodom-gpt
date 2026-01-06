"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGeneralErrors = void 0;
/**
 * Hook to extract general errors (not associated with form fields) from form errors
 * @param errors - Form errors object from useForm
 * @param fieldKeys - Array of field keys that exist in the form
 * @returns Array of general error messages
 */
var useGeneralErrors = function (errors, fieldKeys) {
    if (!errors) {
        return [];
    }
    var generalErrors = [];
    Object.entries(errors).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        // If error is for _general or for a field that doesn't exist in form
        if (key === "_general" || !fieldKeys.includes(key)) {
            if (typeof value === "string") {
                generalErrors.push(value);
            }
            else if (Array.isArray(value)) {
                generalErrors.push.apply(generalErrors, value.filter(function (v) { return typeof v === "string"; }));
            }
        }
    });
    return generalErrors;
};
exports.useGeneralErrors = useGeneralErrors;
