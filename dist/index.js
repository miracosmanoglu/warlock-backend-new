"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var app = express_1["default"]();
// app.use(express.json());
app.use(body_parser_1["default"].json());
app.use("/api/admin", require("./routes/admin"));
app.use("/api/blog", require("./routes/blog"));
app.use("/api/category", require("./routes/category"));
app.use("/api/comment", require("./routes/comment"));
app.use("/api/customer", require("./routes/customer"));
app.use("/api/gig", require("./routes/gig"));
app.use("/api/horoscope", require("./routes/horoscope"));
app.use("/api/horoscopeDescription", require("./routes/horoscopeDescription"));
app.use("/api/warlock", require("./routes/warlock"));
var server = app.listen(process.env.PORT || 3001, function () {
    return console.log("🚀 Server ready at: http://localhost:3001");
});
//# sourceMappingURL=index.js.map