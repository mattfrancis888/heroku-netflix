"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authentication_1 = require("../controllers/authentication");
var passport_1 = require("../services/passport");
var passport_2 = __importDefault(require("passport"));
var requireSignIn = passport_2.default.authenticate("local", { session: false });
//requireSignin uses the locallogin strategy
passport_2.default.use(passport_1.localLogin);
var router = express_1.Router();
//Go through passsport strategy middleware first, if succesfull, will be continuted to signIn middleware
router.post("/signin", requireSignIn, authentication_1.signIn);
router.post("/signup", authentication_1.signUp);
router.post("/token", authentication_1.refreshToken);
router.post("/signout", authentication_1.signOut);
exports.default = router;
