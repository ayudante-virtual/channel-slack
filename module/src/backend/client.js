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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var events_api_1 = require("@slack/events-api");
var interactive_messages_1 = require("@slack/interactive-messages");
var rtm_api_1 = require("@slack/rtm-api");
var web_api_1 = require("@slack/web-api");
var axios_1 = require("axios");
var lodash_1 = require("lodash");
var lru_cache_1 = require("lru-cache");
var ms_1 = require("ms");
var debug = DEBUG('channel-slack-av');
var debugIncoming = debug.sub('incoming');
var debugOutgoing = debug.sub('outgoing');
var outgoingTypes = ['text', 'image', 'actions', 'typing', 'carousel'];
var userCache = new lru_cache_1["default"]({ max: 1000, maxAge: ms_1["default"]('1h') });
var SlackClient = /** @class */ (function () {
    function SlackClient(bp, botId, config, router) {
        this.bp = bp;
        this.botId = botId;
        this.config = config;
        this.router = router;
        this.logger = bp.logger.forBot(botId);
    }
    SlackClient.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.botToken || !this.config.signingSecret) {
                            return [2 /*return*/, this.logger.error("[" + this.botId + "] The bot token and the signing secret must be configured to use this channel.")];
                        }
                        this.client = new web_api_1.WebClient(this.config.botToken);
                        if (this.config.useRTM || this.config.useRTM === undefined) {
                            this.logger.warn("[" + this.botId + "] Slack configured to used legacy RTM");
                            this.rtm = new rtm_api_1.RTMClient(this.config.botToken);
                        }
                        else {
                            this.events = events_api_1.createEventAdapter(this.config.signingSecret);
                        }
                        this.interactive = interactive_messages_1.createMessageAdapter(this.config.signingSecret);
                        return [4 /*yield*/, this._setupRealtime()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._setupInteractiveListener()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SlackClient.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.rtm) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.rtm.disconnect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    SlackClient.prototype._setupInteractiveListener = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.interactive.action({ type: 'button' }, function (payload) { return __awaiter(_this, void 0, void 0, function () {
                            var actionId, label, value;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        debugIncoming("Received interactive message %o", payload);
                                        actionId = lodash_1["default"].get(payload, 'actions[0].action_id', '');
                                        label = lodash_1["default"].get(payload, 'actions[0].text.text', '');
                                        value = lodash_1["default"].get(payload, 'actions[0].value', '');
                                        if (!!actionId.startsWith('discard_action')) return [3 /*break*/, 6];
                                        if (!actionId.startsWith('replace_buttons')) return [3 /*break*/, 2];
                                        return [4 /*yield*/, axios_1["default"].post(payload.response_url, { text: "*" + label + "*" })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 2:
                                        if (!actionId.startsWith('remove_buttons')) return [3 /*break*/, 4];
                                        return [4 /*yield*/, axios_1["default"].post(payload.response_url, { delete_original: true })];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4: return [4 /*yield*/, this.sendEvent(payload, { type: 'quick_reply', text: label, payload: value })];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); });
                        this.interactive.action({ actionId: 'option_selected' }, function (payload) { return __awaiter(_this, void 0, void 0, function () {
                            var label, value;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        label = lodash_1["default"].get(payload, 'actions[0].selected_option.text.text', '');
                                        value = lodash_1["default"].get(payload, 'actions[0].selected_option.value', '');
                                        //  await axios.post(payload.response_url, { text: `*${label}*` })
                                        return [4 /*yield*/, this.sendEvent(payload, { type: 'quick_reply', text: label, payload: value })];
                                    case 1:
                                        //  await axios.post(payload.response_url, { text: `*${label}*` })
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        this.interactive.action({ actionId: 'feedback-overflow' }, function (payload) { return __awaiter(_this, void 0, void 0, function () {
                            var action, blockId, selectedOption, incomingEventId, feedback, events, event;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        debugIncoming("Received feedback %o", payload);
                                        action = payload.actions[0];
                                        blockId = action.block_id;
                                        selectedOption = action.selected_option.value;
                                        incomingEventId = blockId.replace('feedback-', '');
                                        feedback = parseInt(selectedOption);
                                        return [4 /*yield*/, this.bp.events.findEvents({ incomingEventId: incomingEventId, direction: 'incoming' })];
                                    case 1:
                                        events = _a.sent();
                                        event = events[0];
                                        return [4 /*yield*/, this.bp.events.updateEvent(event.id, { feedback: feedback })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        this.router.use("/bots/" + this.botId + "/callback", this.interactive.requestListener());
                        return [4 /*yield*/, this.displayUrl('Interactive', 'callback')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SlackClient.prototype._setupRealtime = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.rtm) return [3 /*break*/, 2];
                        this.listenMessages(this.rtm);
                        return [4 /*yield*/, this.rtm.start()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        this.listenMessages(this.events);
                        this.router.post("/bots/" + this.botId + "/events-callback", this.events.requestListener());
                        return [4 /*yield*/, this.displayUrl('Events', 'events-callback')];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SlackClient.prototype.listenMessages = function (com) {
        var _this = this;
        var discardedSubtypes = ['bot_message', 'message_deleted', 'message_changed'];
        com.on('message', function (payload) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debugIncoming("Received real time payload %o", payload);
                        if (!(!discardedSubtypes.includes(payload.subtype) && !payload.bot_id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendEvent(payload, {
                                type: 'text',
                                text: lodash_1["default"].find(lodash_1["default"].at(payload, ['text', 'files.0.name', 'files.0.title']), function (x) { return x && x.length; }) || 'N/A'
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
    };
    SlackClient.prototype._getUserInfo = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!userCache.has(userId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.client.users
                                    .info({ user: userId })
                                    .then(function (data) { return resolve(data && data.user); })["catch"](function (err) {
                                    debug('error fetching user info:', err);
                                    resolve({});
                                });
                            })];
                    case 1:
                        data = _a.sent();
                        userCache.set(userId, data);
                        _a.label = 2;
                    case 2: return [2 /*return*/, userCache.get(userId) || {}];
                }
            });
        });
    };
    SlackClient.prototype.displayUrl = function (title, end) {
        return __awaiter(this, void 0, void 0, function () {
            var publicPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.router.getPublicPath()];
                    case 1:
                        publicPath = _a.sent();
                        this.logger.info("[" + this.botId + "] " + title + " Endpoint URL: " + publicPath.replace('BOT_ID', this.botId) + "/bots/" + this.botId + "/" + end);
                        return [2 /*return*/];
                }
            });
        });
    };
    SlackClient.prototype.handleOutgoingEvent = function (event, next) {
        return __awaiter(this, void 0, void 0, function () {
            var messageType, blocks, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(event.type === 'typing')) return [3 /*break*/, 4];
                        if (!this.rtm) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.rtm.sendTyping(event.threadId || event.target)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 1000); })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, next(undefined, false)];
                    case 4:
                        messageType = event.type === 'default' ? 'text' : event.type;
                        if (!lodash_1["default"].includes(outgoingTypes, messageType)) {
                            return [2 /*return*/, next(new Error('Unsupported event type: ' + event.type))];
                        }
                        blocks = [];
                        if (messageType === 'image' || messageType === 'actions') {
                            blocks.push(event.payload);
                        }
                        else if (messageType === 'carousel') {
                            event.payload.cards.forEach(function (card) { return blocks.push.apply(blocks, card); });
                        }
                        if (event.payload.quick_replies) {
                            blocks.push({ type: 'section', text: { type: 'mrkdwn', text: event.payload.text } });
                            blocks.push(event.payload.quick_replies);
                        }
                        message = {
                            text: event.payload.text,
                            channel: event.threadId || event.target,
                            blocks: blocks
                        };
                        if (event.payload.collectFeedback && messageType === 'text') {
                            message.blocks = [
                                {
                                    type: 'section',
                                    block_id: "feedback-" + event.incomingEventId,
                                    text: { type: 'mrkdwn', text: event.payload.text },
                                    accessory: {
                                        type: 'overflow',
                                        options: [
                                            {
                                                text: {
                                                    type: 'plain_text',
                                                    text: '👍'
                                                },
                                                value: '1'
                                            },
                                            {
                                                text: {
                                                    type: 'plain_text',
                                                    text: '👎'
                                                },
                                                value: '-1'
                                            }
                                        ],
                                        action_id: 'feedback-overflow'
                                    }
                                }
                            ];
                        }
                        debugOutgoing("Sending message %o", message);
                        return [4 /*yield*/, this.client.chat.postMessage(message)];
                    case 5:
                        _a.sent();
                        next(undefined, false);
                        return [2 /*return*/];
                }
            });
        });
    };
    SlackClient.prototype.sendEvent = function (ctx, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var threadId, target, user, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        threadId = lodash_1["default"].get(ctx, 'channel.id') || lodash_1["default"].get(ctx, 'channel');
                        target = lodash_1["default"].get(ctx, 'user.id') || lodash_1["default"].get(ctx, 'user');
                        user = {};
                        if (!(target && this.config.fetchUserInfo)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._getUserInfo(target.toString())];
                    case 2:
                        user = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.bp.events.sendEvent(this.bp.IO.Event({
                            botId: this.botId,
                            channel: 'slack',
                            direction: 'incoming',
                            payload: __assign(__assign(__assign({}, ctx), payload), { user_info: user }),
                            type: payload.type,
                            preview: payload.text,
                            threadId: threadId && threadId.toString(),
                            target: target && target.toString()
                        }))];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SlackClient;
}());
exports.SlackClient = SlackClient;
function setupMiddleware(bp, clients) {
    return __awaiter(this, void 0, void 0, function () {
        function outgoingHandler(event, next) {
            return __awaiter(this, void 0, void 0, function () {
                var client;
                return __generator(this, function (_a) {
                    if (event.channel !== 'slack') {
                        return [2 /*return*/, next()];
                    }
                    client = clients[event.botId];
                    if (!client) {
                        return [2 /*return*/, next()];
                    }
                    return [2 /*return*/, client.handleOutgoingEvent(event, next)];
                });
            });
        }
        return __generator(this, function (_a) {
            bp.events.registerMiddleware({
                description: 'Sends out messages that targets platform = slack.' +
                    ' This middleware should be placed at the end as it swallows events once sent.',
                direction: 'outgoing',
                handler: outgoingHandler,
                name: 'slack.sendMessages',
                order: 100
            });
            return [2 /*return*/];
        });
    });
}
exports.setupMiddleware = setupMiddleware;
