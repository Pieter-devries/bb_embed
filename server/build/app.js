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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var sdk_1 = require("@looker/sdk");
var sdk_rtl_1 = require("@looker/sdk-rtl");
var sdk_node_1 = require("@looker/sdk-node");
var cors_1 = __importDefault(require("cors"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var user = require('./user.json');
var app = (0, express_1.default)();
var port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
var lookerSession;
var config = {
    api_url: process.env.LOOKER_EMBED_API_URL,
    client_id: process.env.LOOKER_CLIENT_ID,
    client_secret: process.env.LOOKER_CLIENT_SECRET,
    verify_ssl: true
};
var embedSessions = {};
function acquireEmbedSession(userAgent, user) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, acquireLookerSession()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, acquireEmbedSessionInternal(userAgent, user)];
            }
        });
    });
}
// Generates a new Looker Session (Node Session) with config values
var acquireLookerSession = function () { return __awaiter(void 0, void 0, void 0, function () {
    var api_url, client_id_1, client_secret_1, verify_ssl, lookerSettings;
    return __generator(this, function (_a) {
        if (!lookerSession || !lookerSession.activeToken.isActive()) {
            api_url = config.api_url, client_id_1 = config.client_id, client_secret_1 = config.client_secret, verify_ssl = config.verify_ssl;
            try {
                lookerSettings = (0, sdk_rtl_1.DefaultSettings)();
                lookerSettings.readConfig = function () {
                    return {
                        client_id: client_id_1,
                        client_secret: client_secret_1,
                    };
                };
                lookerSettings.base_url = api_url;
                lookerSettings.verify_ssl = verify_ssl;
                lookerSession = new sdk_node_1.NodeSession(lookerSettings);
                lookerSession.login();
            }
            catch (error) {
                console.error('login failed', { error: error });
                throw error;
            }
        }
        return [2 /*return*/];
    });
}); };
// Using the Looker Session object we acquire the Embed session requesting the Looker SDK
var acquireEmbedSessionInternal = function (userAgent, user) { return __awaiter(void 0, void 0, void 0, function () {
    var cacheKey, embedSession, request, sdk, response, authentication_token, authentication_token_ttl, navigation_token, navigation_token_ttl, session_reference_token_ttl, api_token, api_token_ttl, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                cacheKey = "".concat(user.external_user_id, "/").concat(userAgent);
                embedSession = embedSessions[cacheKey];
                request = __assign(__assign({}, user), { session_reference_token: embedSession === null || embedSession === void 0 ? void 0 : embedSession.session_reference_token });
                sdk = new sdk_1.Looker40SDK(lookerSession);
                return [4 /*yield*/, sdk.ok(sdk.acquire_embed_cookieless_session(request, {
                        headers: {
                            'User-Agent': userAgent,
                        },
                    }))];
            case 1:
                response = _a.sent();
                embedSessions[cacheKey] = response;
                authentication_token = response.authentication_token, authentication_token_ttl = response.authentication_token_ttl, navigation_token = response.navigation_token, navigation_token_ttl = response.navigation_token_ttl, session_reference_token_ttl = response.session_reference_token_ttl, api_token = response.api_token, api_token_ttl = response.api_token_ttl;
                return [2 /*return*/, {
                        api_token: api_token,
                        api_token_ttl: api_token_ttl,
                        authentication_token: authentication_token,
                        authentication_token_ttl: authentication_token_ttl,
                        navigation_token: navigation_token,
                        navigation_token_ttl: navigation_token_ttl,
                        session_reference_token_ttl: session_reference_token_ttl,
                    }];
            case 2:
                error_1 = _a.sent();
                console.error('embed session acquire failed', { error: error_1 });
                throw error_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
// After creating an Embed session we start the process for cookieless embed to get a token for the user to use.
function generateEmbedTokens(userAgent, user) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, embedSession, api_token, navigation_token, session_reference_token, sdk, response, cacheKey_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cacheKey = "".concat(user.external_user_id, "/").concat(userAgent);
                    embedSession = embedSessions[cacheKey];
                    if (!embedSession) {
                        console.error('embed session generate tokens failed, session not yet acquired');
                        throw new Error('embed session generate tokens failed, session not yet acquired');
                    }
                    return [4 /*yield*/, acquireLookerSession()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    api_token = embedSession.api_token, navigation_token = embedSession.navigation_token, session_reference_token = embedSession.session_reference_token;
                    sdk = new sdk_1.Looker40SDK(lookerSession);
                    return [4 /*yield*/, sdk.ok(sdk.generate_tokens_for_cookieless_session({
                            api_token: api_token,
                            navigation_token: navigation_token,
                            session_reference_token: session_reference_token || '',
                        }, {
                            headers: {
                                'User-Agent': userAgent,
                            },
                        }))];
                case 3:
                    response = _a.sent();
                    cacheKey_1 = "".concat(user.external_user_id, "/").concat(userAgent);
                    embedSessions[cacheKey_1] = response;
                    return [2 /*return*/, {
                            api_token: response.api_token,
                            api_token_ttl: response.api_token_ttl,
                            navigation_token: response.navigation_token,
                            navigation_token_ttl: response.navigation_token_ttl,
                            session_reference_token_ttl: response.session_reference_token_ttl,
                        }];
                case 4:
                    error_2 = _a.sent();
                    console.error('embed session generate tokens failed', { error: error_2 });
                    throw error_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
app.get('/generate-embed-tokens', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var tokens, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, generateEmbedTokens(req.headers['user-agent'], user)];
                case 1:
                    tokens = _a.sent();
                    res.json(tokens);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    res.status(400).send({ message: err_1.message });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
app.get('/', function (_, res) {
    res.send('If you see this, the server is alive');
});
app.get('/acquire-embed-session', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var tokens, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(req);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, acquireEmbedSession(req.headers['user-agent'], user)];
                case 2:
                    tokens = _a.sent();
                    res.json(tokens);
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    res.status(400).send({ message: err_2.message });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
});
app.listen(port, function () {
    console.log("Server running on port ".concat(port));
});
