"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var cors_1 = __importDefault(require("cors"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var body_parser_1 = __importDefault(require("body-parser"));
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config();
}
var routes_1 = __importDefault(require("./routes"));
var media_1 = __importDefault(require("./routes/media"));
// import protectedRouter from "./routes/protected";
var app = express_1.default();
// middleware for parsing bodies from URL
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(cookie_parser_1.default());
app.use(cors_1.default({ origin: true, credentials: true }));
//with the credentials config above for cors:
//we don't need
// "Access-Control-Allow-Origin": "*",
//in now.json headers
//https://stackoverflow.com/questions/19743396/cors-cannot-use-wildcard-in-access-control-allow-origin-when-credentials-flag-i
console.log("NODE ENV", process.env.NODE_ENV);
app.use("/api/test", function (req, res) {
    res.send("hi");
});
app.use("/api", routes_1.default);
app.use("/api", media_1.default);
// app.use("/", protectedRouter);
var port = 5000;
app.listen(port, function () {
    console.log("App running on port " + port + ".");
});
