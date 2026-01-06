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
var Container = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  max-width: 1000px;\n  margin: 0 auto;\n  padding: 20px;\n  background: #f5f7fb;\n  min-height: 100vh;\n"], ["\n  max-width: 1000px;\n  margin: 0 auto;\n  padding: 20px;\n  background: #f5f7fb;\n  min-height: 100vh;\n"])));
var Header = styled_components_1.default.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  background: white;\n  border-radius: 12px;\n  padding: 20px;\n  margin-bottom: 24px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n"], ["\n  background: white;\n  border-radius: 12px;\n  padding: 20px;\n  margin-bottom: 24px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n"])));
var Title = styled_components_1.default.h2(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  font-size: 1.5rem;\n  color: #2d3748;\n  margin: 0;\n  font-weight: 600;\n"], ["\n  font-size: 1.5rem;\n  color: #2d3748;\n  margin: 0;\n  font-weight: 600;\n"])));
var ChatsContainer = styled_components_1.default.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  display: grid;\n  gap: 16px;\n"], ["\n  display: grid;\n  gap: 16px;\n"])));
var ChatCard = styled_components_1.default.div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  background: white;\n  border-radius: 12px;\n  padding: 20px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n  cursor: pointer;\n\n  &:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n  }\n"], ["\n  background: white;\n  border-radius: 12px;\n  padding: 20px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n  cursor: pointer;\n\n  &:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n  }\n"])));
var ChatHeader = styled_components_1.default.div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 12px;\n"], ["\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 12px;\n"])));
var ChatName = styled_components_1.default.h3(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  font-size: 1.125rem;\n  color: #2d3748;\n  margin: 0;\n  font-weight: 600;\n"], ["\n  font-size: 1.125rem;\n  color: #2d3748;\n  margin: 0;\n  font-weight: 600;\n"])));
var ChatId = styled_components_1.default.span(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n  font-size: 0.875rem;\n  color: #718096;\n  font-family: monospace;\n  background: #f7fafc;\n  padding: 4px 8px;\n  border-radius: 6px;\n"], ["\n  font-size: 0.875rem;\n  color: #718096;\n  font-family: monospace;\n  background: #f7fafc;\n  padding: 4px 8px;\n  border-radius: 6px;\n"])));
var ChatInfo = styled_components_1.default.div(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 12px;\n"], ["\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 12px;\n"])));
var BotInfo = styled_components_1.default.div(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  gap: 8px;\n"], ["\n  display: flex;\n  align-items: center;\n  gap: 8px;\n"])));
var BotName = styled_components_1.default.span(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n  font-size: 0.875rem;\n  color: #4a5568;\n  font-weight: 500;\n"], ["\n  font-size: 0.875rem;\n  color: #4a5568;\n  font-weight: 500;\n"])));
var MessagesCount = styled_components_1.default.span(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\n  font-size: 0.875rem;\n  color: #718096;\n  background: #edf2f7;\n  padding: 4px 8px;\n  border-radius: 6px;\n"], ["\n  font-size: 0.875rem;\n  color: #718096;\n  background: #edf2f7;\n  padding: 4px 8px;\n  border-radius: 6px;\n"])));
var ChatDate = styled_components_1.default.div(templateObject_13 || (templateObject_13 = __makeTemplateObject(["\n  font-size: 0.75rem;\n  color: #a0aec0;\n  text-align: right;\n"], ["\n  font-size: 0.75rem;\n  color: #a0aec0;\n  text-align: right;\n"])));
var LoadingSpinner = styled_components_1.default.div(templateObject_14 || (templateObject_14 = __makeTemplateObject(["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n\n  &::after {\n    content: \"\";\n    width: 48px;\n    height: 48px;\n    border: 4px solid #f3f3f3;\n    border-top: 4px solid #3b82f6;\n    border-radius: 50%;\n    animation: spin 1s linear infinite;\n  }\n\n  @keyframes spin {\n    0% {\n      transform: rotate(0deg);\n    }\n    100% {\n      transform: rotate(360deg);\n    }\n  }\n"], ["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n\n  &::after {\n    content: \"\";\n    width: 48px;\n    height: 48px;\n    border: 4px solid #f3f3f3;\n    border-top: 4px solid #3b82f6;\n    border-radius: 50%;\n    animation: spin 1s linear infinite;\n  }\n\n  @keyframes spin {\n    0% {\n      transform: rotate(0deg);\n    }\n    100% {\n      transform: rotate(360deg);\n    }\n  }\n"])));
var ErrorMessage = styled_components_1.default.div(templateObject_15 || (templateObject_15 = __makeTemplateObject(["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  color: #ef4444;\n  font-size: 1.125rem;\n"], ["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  color: #ef4444;\n  font-size: 1.125rem;\n"])));
var EmptyState = styled_components_1.default.div(templateObject_16 || (templateObject_16 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n  color: #718096;\n  font-size: 1.125rem;\n"], ["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n  color: #718096;\n  font-size: 1.125rem;\n"])));
var formatDate = function (dateString) {
    var date = new Date(dateString);
    var day = date.getDate().toString().padStart(2, "0");
    var month = (date.getMonth() + 1).toString().padStart(2, "0");
    var year = date.getFullYear();
    var hours = date.getHours().toString().padStart(2, "0");
    var minutes = date.getMinutes().toString().padStart(2, "0");
    return "".concat(day, ".").concat(month, ".").concat(year, ", ").concat(hours, ":").concat(minutes);
};
var ShowUserChats = function (_a) {
    var record = _a.record;
    var userId = record.params.id;
    var _b = (0, react_1.useState)(null), userChatsData = _b[0], setUserChatsData = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    (0, react_1.useEffect)(function () {
        var fetchUserChats = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, fetch("/admin/api/users/".concat(userId, "/chats"))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch user chats");
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        setUserChatsData(data);
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
        fetchUserChats();
    }, [userId]);
    var handleChatClick = function (chatId) {
        // Navigate to chat resource
        window.open("/admin/resources/Chat/records/".concat(chatId, "/show"), "_blank");
    };
    if (loading) {
        return <LoadingSpinner />;
    }
    if (error) {
        return <ErrorMessage>Error: {error}</ErrorMessage>;
    }
    if (!userChatsData) {
        return null;
    }
    return (<Container>
      <Header>
        <Title>
          Chats for user:{" "}
          {userChatsData.user.username ||
            "ID: ".concat(userChatsData.user.id)}
        </Title>
      </Header>

      <ChatsContainer>
        {userChatsData.chats.length === 0 ? (<EmptyState>
            <p>No chats found for this user.</p>
          </EmptyState>) : (userChatsData.chats
            .sort(function (a, b) {
            return new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime();
        })
            .map(function (chat) { return (<ChatCard key={chat.id} onClick={function () { return handleChatClick(chat.id); }}>
                <ChatHeader>
                  <ChatName>
                    {chat.name || "Chat ".concat(chat.id.slice(0, 8), "...")}
                  </ChatName>
                  <ChatId>{chat.id}</ChatId>
                </ChatHeader>

                <ChatInfo>
                  <BotInfo>
                    {chat.bot ? (<>
                        <span>🤖</span>
                        <BotName>{chat.bot.name}</BotName>
                      </>) : (<BotName>No bot assigned</BotName>)}
                  </BotInfo>
                  <MessagesCount>
                    {chat.messagesCount} messages
                  </MessagesCount>
                </ChatInfo>

                <ChatDate>{formatDate(chat.createdAt)}</ChatDate>
              </ChatCard>); }))}
      </ChatsContainer>
    </Container>);
};
exports.default = ShowUserChats;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16;
