"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var styled_components_1 = require("styled-components");
var FormContainer = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  padding: 20px;\n  max-width: 600px;\n  margin: 0 auto;\n"], ["\n  padding: 20px;\n  max-width: 600px;\n  margin: 0 auto;\n"])));
var StyledForm = styled_components_1.default.form(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n"], ["\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n"])));
var StyledTextarea = styled_components_1.default.textarea(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  width: 100%;\n  min-height: 150px;\n  padding: 12px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  font-size: 14px;\n  resize: vertical;\n\n  &:focus {\n    outline: none;\n    border-color: #1a73e8;\n    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);\n  }\n"], ["\n  width: 100%;\n  min-height: 150px;\n  padding: 12px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  font-size: 14px;\n  resize: vertical;\n\n  &:focus {\n    outline: none;\n    border-color: #1a73e8;\n    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);\n  }\n"])));
var SendButton = styled_components_1.default.button(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  background-color: #1a73e8;\n  color: white;\n  border: none;\n  padding: 12px 24px;\n  border-radius: 8px;\n  font-size: 14px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: background-color 0.2s;\n\n  &:hover {\n    background-color: #1557b0;\n  }\n\n  &:disabled {\n    background-color: #ccc;\n    cursor: not-allowed;\n  }\n"], ["\n  background-color: #1a73e8;\n  color: white;\n  border: none;\n  padding: 12px 24px;\n  border-radius: 8px;\n  font-size: 14px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: background-color 0.2s;\n\n  &:hover {\n    background-color: #1557b0;\n  }\n\n  &:disabled {\n    background-color: #ccc;\n    cursor: not-allowed;\n  }\n"])));
var SendMessage = function (_a) {
    var record = _a.record;
    var chatId = record.params.id;
    var botId = record.params.bot;
    var _b = (0, react_1.useState)(""), message = _b[0], setMessage = _b[1];
    var _c = (0, react_1.useState)(false), isLoading = _c[0], setIsLoading = _c[1];
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!message.trim())
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("/admin/api/message", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                botId: botId,
                                chatId: chatId,
                                message: message.trim(),
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to send message");
                    }
                    setMessage("");
                    alert("Message sent successfully!");
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error sending message:", error_1);
                    alert("Failed to send message. Please try again.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<FormContainer>
      <p>Chat ID: {chatId}</p>
      <p>Bot ID: {botId}</p>

      <StyledForm onSubmit={handleSubmit}>
        <StyledTextarea value={message} onChange={function (e) {
            return setMessage(e.target.value);
        }} placeholder="Type your message here..." disabled={isLoading}/>
        <SendButton type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? "Sending..." : "Send Message"}
        </SendButton>
      </StyledForm>
    </FormContainer>);
};
exports.default = SendMessage;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
