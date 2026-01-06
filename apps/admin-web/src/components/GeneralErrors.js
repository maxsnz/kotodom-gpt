"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralErrors = void 0;
var core_1 = require("@mantine/core");
var GeneralErrors = function (_a) {
    var errors = _a.errors;
    if (errors.length === 0) {
        return null;
    }
    return (<core_1.Alert color="red" mt="md">
      {errors.map(function (error, index) { return (<div key={index}>{error}</div>); })}
    </core_1.Alert>);
};
exports.GeneralErrors = GeneralErrors;
