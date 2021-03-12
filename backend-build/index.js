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
var path_1 = __importDefault(require("path"));
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
//NOTE: app.use below that uses authenticateToken MUST ALWAYS BE LAST of the routes.
// At every "/" , if we have an expired JWT, it will send an error
//and none of the routes afterwards will work. By putting it last, we could send an error and get a new access token with "/token"
//WE WILL NOT BE USING THIS BELOW BECAUSE WE ARE NOT SENDING AUTHORIZATION HEADERS
//BECAUSE NOCK CANNOT MOCK HTTP REQUESTS WITH HEADERS
//app.use("/api", authenticateToken);
//All other roues will be handled by
app.use(express_1.default.static(path_1.default.join(__dirname, "build")));
app.get("*", function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "build", "index.html"));
});
// const root = require("path").join(__dirname, "build");
// app.use(express.static(root));
// app.get("*", (req, res) => {
//     res.sendFile("index.html", { root });
// });
var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("App running on port " + port + ".");
});
