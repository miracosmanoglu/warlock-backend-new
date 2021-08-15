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
exports.__esModule = true;
var client_1 = require("@prisma/client");
var express_1 = __importDefault(require("express"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var lodash_1 = __importDefault(require("lodash"));
var SECRET = "asbadbbdbbh7788888887hb113h3hbb";
var prisma = new client_1.PrismaClient();
var router = express_1["default"].Router();
router.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, filteredAdmin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.id;
                return [4 /*yield*/, prisma.admin.findUnique({
                        where: {
                            id: id
                        }
                    })];
            case 1:
                filteredAdmin = _a.sent();
                res.json(filteredAdmin);
                return [2 /*return*/];
        }
    });
}); });
router.post("/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, username, name, surname, phone, password, about, image, emailExist, usernameExist, phoneExist, _b, admin, e_1, e_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, email = _a.email, username = _a.username, name = _a.name, surname = _a.surname, phone = _a.phone, password = _a.password, about = _a.about, image = _a.image;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 10, , 11]);
                return [4 /*yield*/, prisma.admin.findMany({
                        where: { email: email }
                    })];
            case 2:
                emailExist = _c.sent();
                if (emailExist.length != 0) {
                    res.send(JSON.stringify({
                        status: 302,
                        error: "admin is found with that email"
                    }));
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.admin.findMany({
                        where: { username: username }
                    })];
            case 3:
                usernameExist = _c.sent();
                if (usernameExist.length != 0) {
                    res.send(JSON.stringify({
                        status: 302,
                        error: "admin is found with that username"
                    }));
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.admin.findMany({
                        where: { phone: phone }
                    })];
            case 4:
                phoneExist = _c.sent();
                if (phoneExist.length != 0) {
                    res.send(JSON.stringify({
                        status: 302,
                        error: "admin is found with that phone"
                    }));
                    return [2 /*return*/];
                }
                _b = req.body;
                return [4 /*yield*/, bcrypt_1["default"].hash(req.body.password, 12)];
            case 5:
                _b.password = _c.sent();
                _c.label = 6;
            case 6:
                _c.trys.push([6, 8, , 9]);
                return [4 /*yield*/, prisma.admin.create({
                        data: {
                            email: email,
                            username: username,
                            name: name,
                            surname: surname,
                            phone: phone,
                            password: req.body.password,
                            about: about,
                            image: image
                        }
                    })];
            case 7:
                admin = _c.sent();
                res.send(JSON.stringify({ status: 200, error: null, response: admin.id }));
                return [3 /*break*/, 9];
            case 8:
                e_1 = _c.sent();
                res.send(JSON.stringify({
                    status: 500,
                    error: "In create admin " + e_1,
                    response: null
                }));
                return [3 /*break*/, 9];
            case 9: return [3 /*break*/, 11];
            case 10:
                e_2 = _c.sent();
                res.send(JSON.stringify({ status: 500, error: "In admin " + e_2, response: null }));
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
router.post("/login", function login(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var email, admin, valid, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email = req.body.email;
                    return [4 /*yield*/, prisma.admin.findMany({
                            where: { email: email }
                        })];
                case 1:
                    admin = _a.sent();
                    if (admin.length === 0) {
                        res.send(JSON.stringify({
                            status: 404,
                            error: "Not admin with that email",
                            token: null
                        }));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, bcrypt_1["default"].compare(req.body.password, admin[0].password)];
                case 2:
                    valid = _a.sent();
                    if (!valid) {
                        res.send(JSON.stringify({ status: 404, error: "Incorrect password", token: null }));
                        return [2 /*return*/];
                    }
                    token = jsonwebtoken_1["default"].sign({
                        user: lodash_1["default"].pick(admin[0], ["id", "email", "role"])
                    }, SECRET, {
                        expiresIn: "2 days"
                    });
                    res.send(JSON.stringify({ status: 200, error: null, token: token }));
                    return [2 /*return*/];
            }
        });
    });
});
module.exports = router;
//# sourceMappingURL=admin.js.map