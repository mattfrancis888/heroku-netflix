"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = exports.authenticateToken = exports.refreshToken = void 0;
var databasePool_1 = __importDefault(require("../databasePool"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var constants_1 = require("../constants");
var PRIVATE_KEY = process.env.privateKey;
var ACCESS_TOKEN = "ACCESS_TOKEN";
var REFRESH_TOKEN = "REFRESH_TOKEN";
var generateAccessToken = function (email, privateKey) {
    //Generate a token by using user email  and 'secret key'
    //iat- issued at  property is implemented by default
    //create token with these properties below and privatekey
    //for example, if our email variable is super long, our token might be super long
    return jsonwebtoken_1.default.sign({ subject: email }, privateKey, {
        expiresIn: "15s",
    });
};
var generateRefreshToken = function (email, privateKey) {
    return jsonwebtoken_1.default.sign({ subject: email }, privateKey);
};
var refreshToken = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken;
    var _a, _b;
    return __generator(this, function (_c) {
        refreshToken = (_b = (_a = req.headers["cookie"]) === null || _a === void 0 ? void 0 : _a.split(";").map(function (item) { return item.trim(); }).find(function (str) { return str.startsWith(REFRESH_TOKEN); })) === null || _b === void 0 ? void 0 : _b.split("=").pop();
        if (PRIVATE_KEY && refreshToken) {
            //Validate token:
            jsonwebtoken_1.default.verify(refreshToken, PRIVATE_KEY, function (err, user) {
                if (err)
                    return res.sendStatus(constants_1.FORBIDDEN_STATUS);
            });
            //Check if token is in database (in the case the attacker forged their own refresh token)
            databasePool_1.default.query("SELECT email, refresh_token FROM auth WHERE refresh_token = $1", [refreshToken], function (error, user) {
                if (error) {
                    return res.sendStatus(constants_1.INTERNAL_SERVER_ERROR_STATUS);
                }
                if (user.rowCount === 0) {
                    return res.sendStatus(constants_1.FORBIDDEN_STATUS);
                }
                //If the refresh token matches the one in our database
                //Generate a new access token for the user to use
                // For acces token,  flags should be "secure: true"
                //For refreshtoken "secure: true" and "httpOnly: true" sameSite="strict"
                //Note: cookies will not be shown in http://localhost dev tools because if it has flags of secure
                /// but POSTMAN will show your cookies
                ////Cookies, when used with the HttpOnly cookie flag, are not accessible through JavaScript, and are immune to XSS
                var token = generateAccessToken(user.rows[0].email, PRIVATE_KEY);
                // res.setHeader("set-cookie", [
                //     `ACCESS_TOKEN=${token}; samesite=lax;`,
                // ]);
                //Chrome's default settings for cookie is samesite=lax; to avoid CSRF attacks
                //We should make it sameSite=Strict,
                // res.cookie(ACCESS_TOKEN, token, {
                //     secure: true, //needs secure tag when we have sameSite tag
                //     sameSite: "strict",
                // });
                //For development, we remove secure because it's on http:
                res.cookie(ACCESS_TOKEN, token);
                res.send({
                    token: token,
                });
            });
        }
        else {
            res.send(constants_1.FORBIDDEN_STATUS);
        }
        return [2 /*return*/];
    });
}); };
exports.refreshToken = refreshToken;
var authenticateToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token;
    return __generator(this, function (_a) {
        token = req.headers["authorization"];
        if (PRIVATE_KEY && token) {
            try {
                //Check if token is valid / has not expired
                jsonwebtoken_1.default.verify(token, PRIVATE_KEY);
                res.send({ token: token });
                // next();
            }
            catch (error) {
                console.log("authenticateTokenError", error);
                return [2 /*return*/, res.sendStatus(constants_1.FORBIDDEN_STATUS)];
            }
        }
        else {
            res.sendStatus(constants_1.FORBIDDEN_STATUS);
        }
        return [2 /*return*/];
    });
}); };
exports.authenticateToken = authenticateToken;
// export const signOut = async (req: Request, res: Response) => {
//     const refreshToken = req.headers["cookie"]
//         ?.split(";")
//         .map((item: any) => item.trim())
//         .find((str: string) => str.startsWith(REFRESH_TOKEN))
//         ?.split("=")
//         .pop();
//     if (refreshToken) {
//         pool.query(
//             `UPDATE auth SET refresh_token = null WHERE refresh_token = '${refreshToken}'`,
//             (error, user) => {
//                 if (error) return res.send(INTERNAL_SERVER_ERROR_STATUS);
//                 res.clearCookie(ACCESS_TOKEN);
//                 res.clearCookie(REFRESH_TOKEN);
//                 res.send({ token: "" });
//             }
//         );
//     } else {
//         res.sendStatus(FORBIDDEN_STATUS);
//     }
// };
// export const signIn = (req: any, res: Response) => {
//     if (PRIVATE_KEY) {
//         //req.user exists because of the done(null, user) used in the Strategies at passport.ts
//         // console.log("REQ.USER", req.user.email);
//         const refreshToken = generateRefreshToken(req.user.email, PRIVATE_KEY);
//         const token = generateAccessToken(req.user.email, PRIVATE_KEY);
//         // Update Refresh token to database
//         pool.query(
//             `UPDATE auth
//         SET refresh_token = $1 WHERE email = $2`,
//             [refreshToken, req.user.email],
//             (error, response) => {
//                 if (error) return res.send(FORBIDDEN_STATUS);
//                 // For acces token,  flags should be "secure: true"
//                 //For refreshtoken "secure: true" and "httpOnly: true"
//                 //Note: cookies will not be shown in http://localhost dev tools because it has flags of secure
//                 //and http only; but POSTMAN will show your cookies
//                 //Note: ORDER IS IMPORTANT, SEND setHeader FIRST EBFORE SENDING cookie!
//                 // res.setHeader("set-cookie", [
//                 //     `REFRESH_TOKEN=${refreshToken}; httponly;`,
//                 // ]);
//                 //Chrome's default settings for cookie is samesite=Strict (to avoid CSRF attacks) and Secure
//                 //We should make it samesite=strict
//                 // res.cookie(REFRESH_TOKEN, refreshToken, {
//                 //     sameSite: "strict",
//                 //     secure: true,
//                 //     httpOnly: true,
//                 // });
//                 // res.cookie(ACCESS_TOKEN, token, {
//                 //     sameSite: "strict",
//                 //     secure: true,
//                 // });
//                 //For development, we remove secure because it's on http:
//                 res.cookie(REFRESH_TOKEN, refreshToken, {
//                     httpOnly: true,
//                 });
//                 res.cookie(ACCESS_TOKEN, token);
//                 res.send({
//                     token,
//                     refreshToken,
//                 });
//             }
//         );
//     } else {
//         res.send(FORBIDDEN_STATUS);
//     }
// };
var signUp = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var email, password, refreshToken_1, token, UNPROCESSABLE_ENTITY_STATUS, checkEmailResponse, saltRounds, hash, hashedPassword, error_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!PRIVATE_KEY) return [3 /*break*/, 10];
                email = req.body.email;
                password = req.body.password;
                refreshToken_1 = generateRefreshToken(email, PRIVATE_KEY);
                token = generateAccessToken(email, PRIVATE_KEY);
                UNPROCESSABLE_ENTITY_STATUS = 422;
                //Email or password not given
                if (!email || !password) {
                    return [2 /*return*/, res
                            .status(UNPROCESSABLE_ENTITY_STATUS)
                            .send({ error: "Email and password must be provided" })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                return [4 /*yield*/, databasePool_1.default.query("SELECT * from auth WHERE email = '" + email + "'")];
            case 2:
                checkEmailResponse = _a.sent();
                //User already exist
                if (checkEmailResponse.rows.length > 0) {
                    //422 is UNPROCESSABLE_ETITY; data user gave was "bad/unproceesssed"
                    return [2 /*return*/, res
                            .status(UNPROCESSABLE_ENTITY_STATUS)
                            .send({ error: "Email in use" })];
                }
                saltRounds = 10;
                return [4 /*yield*/, bcrypt_1.default.hash(password, saltRounds)];
            case 3:
                hash = _a.sent();
                hashedPassword = hash;
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, databasePool_1.default.query(" INSERT INTO auth(email, password, refresh_token)VALUES($1, $2, $3)", [email, hashedPassword, refreshToken_1])];
            case 5:
                _a.sent();
                //Generate a token when user signs in, this token will be used so that they can access protected routes
                //Chrome's default settings for cookie is samesite=Strict (to avoid CSRF attacks) and Secure
                //We should make it samesite=strict
                // res.cookie(REFRESH_TOKEN, refreshToken, {
                //     sameSite: "strict",
                //     secure: true,
                //     httpOnly: true,
                // });
                // res.cookie(ACCESS_TOKEN, token, {
                //     sameSite: "strict",
                //     secure: true,
                // });
                //For development, we remove secure because it's on http:
                res.cookie(REFRESH_TOKEN, refreshToken_1, {
                    httpOnly: true,
                });
                res.cookie(ACCESS_TOKEN, token);
                res.send({
                    token: token,
                });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                databasePool_1.default.query("ROLLBACK");
                console.log("ROLLBACK TRIGGERED");
                return [2 /*return*/, res.sendStatus(constants_1.INTERNAL_SERVER_ERROR_STATUS)];
            case 7: return [3 /*break*/, 9];
            case 8:
                error_2 = _a.sent();
                return [2 /*return*/, res.sendStatus(constants_1.INTERNAL_SERVER_ERROR_STATUS)];
            case 9: return [3 /*break*/, 11];
            case 10:
                res.send(constants_1.FORBIDDEN_STATUS);
                _a.label = 11;
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.signUp = signUp;
