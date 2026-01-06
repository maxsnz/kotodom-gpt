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
var node_fetch_1 = require("node-fetch");
var https_proxy_agent_1 = require("https-proxy-agent");
function createFetchWithProxy(proxyUrl) {
    var agent = new https_proxy_agent_1.HttpsProxyAgent(proxyUrl);
    return function (url, options) {
        var modifiedOptions = __assign(__assign({}, options), { agent: agent });
        return (0, node_fetch_1.default)(url, modifiedOptions);
    };
}
exports.default = createFetchWithProxy;
