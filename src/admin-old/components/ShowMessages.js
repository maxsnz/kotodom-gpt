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
var Container = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n  background: #f5f7fb;\n  min-height: 100vh;\n"], ["\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n  background: #f5f7fb;\n  min-height: 100vh;\n"])));
var Header = styled_components_1.default.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  background: white;\n  border-radius: 12px;\n  padding: 20px;\n  margin-bottom: 24px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n"], ["\n  background: white;\n  border-radius: 12px;\n  padding: 20px;\n  margin-bottom: 24px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n"])));
var Title = styled_components_1.default.h2(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  font-size: 1.5rem;\n  color: #2d3748;\n  margin: 0;\n  font-weight: 600;\n"], ["\n  font-size: 1.5rem;\n  color: #2d3748;\n  margin: 0;\n  font-weight: 600;\n"])));
var MessagesContainer = styled_components_1.default.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n"], ["\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n"])));
var MessageWrapper = styled_components_1.default.div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  display: flex;\n  justify-content: ", ";\n  padding: 0 8px;\n"], ["\n  display: flex;\n  justify-content: ", ";\n  padding: 0 8px;\n"])), function (props) {
    return props.isUser ? "flex-start" : "flex-end";
});
var MessageBubble = styled_components_1.default.div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  max-width: 70%;\n  padding: 12px 16px;\n  border-radius: 16px;\n  background: ", ";\n  color: ", ";\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n  position: relative;\n\n  &::before {\n    content: \"\";\n    position: absolute;\n    bottom: 0;\n    ", "\n    width: 16px;\n    height: 16px;\n    background: ", ";\n    clip-path: ", ";\n  }\n"], ["\n  max-width: 70%;\n  padding: 12px 16px;\n  border-radius: 16px;\n  background: ", ";\n  color: ", ";\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n  position: relative;\n\n  &::before {\n    content: \"\";\n    position: absolute;\n    bottom: 0;\n    ", "\n    width: 16px;\n    height: 16px;\n    background: ", ";\n    clip-path: ", ";\n  }\n"])), function (props) { return (props.isUser ? "white" : "#3b82f6"); }, function (props) { return (props.isUser ? "#2d3748" : "white"); }, function (props) { return (props.isUser ? "left: -8px;" : "right: -8px;"); }, function (props) { return (props.isUser ? "white" : "#3b82f6"); }, function (props) {
    return props.isUser
        ? "polygon(0 0, 100% 100%, 0 100%)"
        : "polygon(100% 0, 100% 100%, 0 100%)";
});
var SenderName = styled_components_1.default.div(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  font-size: 0.875rem;\n  font-weight: 500;\n  margin-bottom: 4px;\n  opacity: 0.9;\n"], ["\n  font-size: 0.875rem;\n  font-weight: 500;\n  margin-bottom: 4px;\n  opacity: 0.9;\n"])));
var MessageText = styled_components_1.default.div(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n  font-size: 1rem;\n  line-height: 1.5;\n  white-space: pre-wrap;\n  word-break: break-word;\n"], ["\n  font-size: 1rem;\n  line-height: 1.5;\n  white-space: pre-wrap;\n  word-break: break-word;\n"])));
var Timestamp = styled_components_1.default.div(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n  font-size: 0.75rem;\n  opacity: 0.7;\n  margin-top: 4px;\n  text-align: right;\n"], ["\n  font-size: 0.75rem;\n  opacity: 0.7;\n  margin-top: 4px;\n  text-align: right;\n"])));
var PriceDisplay = styled_components_1.default.div(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n  font-size: 0.875rem;\n  font-weight: 600;\n  margin-top: 8px;\n  padding: 4px 8px;\n  background: rgba(255, 255, 255, 0.2);\n  border-radius: 8px;\n  text-align: center;\n"], ["\n  font-size: 0.875rem;\n  font-weight: 600;\n  margin-top: 8px;\n  padding: 4px 8px;\n  background: rgba(255, 255, 255, 0.2);\n  border-radius: 8px;\n  text-align: center;\n"])));
var LoadingSpinner = styled_components_1.default.div(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n\n  &::after {\n    content: \"\";\n    width: 48px;\n    height: 48px;\n    border: 4px solid #f3f3f3;\n    border-top: 4px solid #3b82f6;\n    border-radius: 50%;\n    animation: spin 1s linear infinite;\n  }\n\n  @keyframes spin {\n    0% {\n      transform: rotate(0deg);\n    }\n    100% {\n      transform: rotate(360deg);\n    }\n  }\n"], ["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n\n  &::after {\n    content: \"\";\n    width: 48px;\n    height: 48px;\n    border: 4px solid #f3f3f3;\n    border-top: 4px solid #3b82f6;\n    border-radius: 50%;\n    animation: spin 1s linear infinite;\n  }\n\n  @keyframes spin {\n    0% {\n      transform: rotate(0deg);\n    }\n    100% {\n      transform: rotate(360deg);\n    }\n  }\n"])));
var ErrorMessage = styled_components_1.default.div(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  color: #ef4444;\n  font-size: 1.125rem;\n"], ["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  color: #ef4444;\n  font-size: 1.125rem;\n"])));
var formatDate = function (dateString) {
    var date = new Date(dateString);
    var day = date.getDate().toString().padStart(2, "0");
    var month = (date.getMonth() + 1).toString().padStart(2, "0");
    var year = date.getFullYear();
    var hours = date.getHours().toString().padStart(2, "0");
    var minutes = date.getMinutes().toString().padStart(2, "0");
    return "".concat(day, ".").concat(month, ".").concat(year, ", ").concat(hours, ":").concat(minutes);
};
var ShowMessages = function (_a) {
    var record = _a.record;
    var chatId = record.params.id;
    var _b = (0, react_1.useState)(null), chatData = _b[0], setChatData = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    (0, react_1.useEffect)(function () {
        var fetchMessages = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, fetch("/admin/api/messages/".concat(chatId))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch messages");
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        setChatData(data);
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        setError(err_1 instanceof Error ? err_1.message : "An error occurred");
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchMessages();
    }, [chatId]);
    if (loading) {
        return <LoadingSpinner />;
    }
    if (error) {
        return <ErrorMessage>Error: {error}</ErrorMessage>;
    }
    if (!chatData) {
        return null;
    }
    return (<Container>
      <Header>
        <Title>
          Chat between {chatData.user.username} and{" "}
          {chatData.bot.name}
        </Title>
      </Header>

      <MessagesContainer>
        {chatData.messages
            .sort(function (a, b) {
            return new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime();
        })
            .map(function (message) { return (<MessageWrapper key={message.id} isUser={message.isUser}>
              <MessageBubble isUser={message.isUser}>
                <SenderName>
                  {message.isUser
                ? chatData.user.username
                : chatData.bot.name}
                </SenderName>
                <MessageText>{message.text}</MessageText>
                {Number(message.price) > 0 && (<PriceDisplay>
                    $
                    {Number(message.price) < 0.01
                    ? Number(message.price).toFixed(6)
                    : Number(message.price).toFixed(2)}
                  </PriceDisplay>)}
                <Timestamp>{formatDate(message.createdAt)}</Timestamp>
              </MessageBubble>
            </MessageWrapper>); })}
      </MessagesContainer>
    </Container>);
};
exports.default = ShowMessages;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12;
