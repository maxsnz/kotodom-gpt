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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataProvider = void 0;
// import dataProviderBase from "@refinedev/simple-rest";
var nestjsx_crud_1 = require("@refinedev/nestjsx-crud");
// Transform NestJS validation errors to Refine format
// Now NestJS returns errors in structured format: { errors: { field: [messages] } }
var transformNestJSErrors = function (error) {
    var _a;
    // Handle different error structures (axios vs fetch vs direct object)
    // @refinedev/nestjsx-crud may return error directly as object, not in response.data
    var responseData = ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || (error === null || error === void 0 ? void 0 : error.data) || error;
    if (!responseData || typeof responseData !== "object") {
        return error;
    }
    // If server already returns structured errors, use them directly
    if (responseData.errors && typeof responseData.errors === "object") {
        // Refine/Mantine expects errors in format: { field: string } or { field: string[] }
        // Convert arrays to first message string for Mantine form compatibility
        var formattedErrors_1 = {};
        Object.entries(responseData.errors).forEach(function (_a) {
            var field = _a[0], messages = _a[1];
            if (Array.isArray(messages) && messages.length > 0) {
                formattedErrors_1[field] = messages[0];
            }
            else if (typeof messages === "string") {
                formattedErrors_1[field] = messages;
            }
        });
        // Ensure errors object is in the correct format for Refine
        // Refine's useForm looks for errors in error.response.data.errors
        // Remove message to prevent Refine from using it as a general error
        var message = responseData.message, _ = responseData.errors, dataWithoutMessage = __rest(responseData, ["message", "errors"]);
        var transformedError = __assign(__assign({}, error), { 
            // Remove message from error to prevent Refine from using it
            message: undefined, 
            // Add errors at top level for Refine
            errors: formattedErrors_1, response: error.response
                ? __assign(__assign({}, error.response), { data: __assign(__assign({}, dataWithoutMessage), { errors: formattedErrors_1 }) }) : {
                status: error.status || error.statusCode || 400,
                statusText: error.statusText || "Bad Request",
                data: __assign(__assign({}, dataWithoutMessage), { errors: formattedErrors_1 }),
            } });
        return transformedError;
    }
    // Fallback: if errors object doesn't exist but message does, create errors object
    if (responseData.message) {
        var errors_1 = {};
        if (Array.isArray(responseData.message)) {
            // Multiple messages - try to extract field names
            responseData.message.forEach(function (msg) {
                if (typeof msg !== "string")
                    return;
                var fieldMatch = msg.match(/^(?:property\s+)?(\w+)\s+(?:should|must|is|has)/i);
                var field = fieldMatch ? fieldMatch[1].toLowerCase() : "_general";
                if (!errors_1[field]) {
                    errors_1[field] = [];
                }
                errors_1[field].push(msg);
            });
        }
        else if (typeof responseData.message === "string") {
            // Single message
            errors_1["_general"] = [responseData.message];
        }
        // Convert arrays to strings for Mantine form
        var formattedErrors_2 = {};
        Object.entries(errors_1).forEach(function (_a) {
            var field = _a[0], messages = _a[1];
            if (Array.isArray(messages) && messages.length > 0) {
                formattedErrors_2[field] = messages[0];
            }
        });
        // Add errors at top level for Refine
        var transformedError = __assign(__assign({}, error), { errors: formattedErrors_2, response: error.response
                ? __assign(__assign({}, error.response), { data: __assign(__assign({}, responseData), { errors: formattedErrors_2 }) }) : {
                status: error.status || 400,
                statusText: error.statusText || "Bad Request",
                data: __assign(__assign({}, responseData), { errors: formattedErrors_2 }),
            } });
        return transformedError;
    }
    return error;
};
var dataProvider = function (apiUrl) {
    var baseDataProvider = (0, nestjsx_crud_1.default)(apiUrl);
    // Custom create method to intercept HTTP response before nestjsx-crud processes it
    var createWithDirectFetch = function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var dataToSend, response, errorData, error, data, error_1, transformedError;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dataToSend = ((_a = params.variables) === null || _a === void 0 ? void 0 : _a.data) || params.variables || params.data;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/").concat(params.resource), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(dataToSend),
                        })];
                case 2:
                    response = _b.sent();
                    if (!(response.status < 200 || response.status > 299)) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _b.sent();
                    error = {
                        statusCode: response.status,
                        status: response.status,
                        statusText: response.statusText,
                        response: {
                            status: response.status,
                            statusText: response.statusText,
                            data: errorData,
                        },
                        data: errorData,
                    };
                    throw error;
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _b.sent();
                    return [2 /*return*/, { data: data }];
                case 6:
                    error_1 = _b.sent();
                    transformedError = transformNestJSErrors(error_1);
                    throw transformedError;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Custom update method to intercept HTTP response before nestjsx-crud processes it
    var updateWithDirectFetch = function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var dataToSend, response, errorData, error, data, error_2, transformedError;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dataToSend = ((_a = params.variables) === null || _a === void 0 ? void 0 : _a.data) || params.variables || params.data;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/").concat(params.resource, "/").concat(params.id), {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(dataToSend),
                        })];
                case 2:
                    response = _b.sent();
                    if (!(response.status < 200 || response.status > 299)) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _b.sent();
                    error = {
                        statusCode: response.status,
                        status: response.status,
                        statusText: response.statusText,
                        response: {
                            status: response.status,
                            statusText: response.statusText,
                            data: errorData,
                        },
                        data: errorData,
                    };
                    throw error;
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _b.sent();
                    return [2 /*return*/, { data: data }];
                case 6:
                    error_2 = _b.sent();
                    transformedError = transformNestJSErrors(error_2);
                    throw transformedError;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return __assign(__assign({}, baseDataProvider), { create: createWithDirectFetch, update: updateWithDirectFetch, getList: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var params, response, data;
            var _c;
            var resource = _b.resource, pagination = _b.pagination, filters = _b.filters, sorters = _b.sorters;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        params = new URLSearchParams();
                        if (pagination && pagination.currentPage && pagination.pageSize) {
                            params.set("page", pagination.currentPage.toString());
                            params.set("limit", pagination.pageSize.toString());
                        }
                        if (filters) {
                            filters.forEach(function (filter) {
                                if ("field" in filter) {
                                    params.set(filter.field, filter.value.toString());
                                }
                            });
                        }
                        if (sorters) {
                            sorters.forEach(function (sorter) {
                                params.set(sorter.field, sorter.order.toString());
                            });
                        }
                        return [4 /*yield*/, fetch("/api/".concat(resource, "?").concat(params.toString()))];
                    case 1:
                        response = _d.sent();
                        if (response.status < 200 || response.status > 299)
                            throw response;
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _d.sent();
                        return [2 /*return*/, {
                                data: data.data,
                                total: Number((_c = data.meta) === null || _c === void 0 ? void 0 : _c.total),
                                meta: data.meta,
                            }];
                }
            });
        }); } });
};
exports.dataProvider = dataProvider;
