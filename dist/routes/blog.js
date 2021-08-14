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
var authentication_1 = require("../utils/authentication");
var SECRET = "asbadbbdbbh7788888887hb113h3hbb";
var prisma = new client_1.PrismaClient();
var router = express_1["default"].Router();
router.get("/all", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var blogs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.blog.findMany({})];
            case 1:
                blogs = _a.sent();
                res.json(blogs);
                return [2 /*return*/];
        }
    });
}); });
router.post("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, image, adminId, user, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, title = _a.title, description = _a.description, image = _a.image, adminId = _a.adminId;
                return [4 /*yield*/, authentication_1.getUserId(req)];
            case 1:
                user = _b.sent();
                if (user === null || user.message) {
                    res.send(JSON.stringify({
                        status: 401,
                        error: "JWT expired or not provided",
                        response: null
                    }));
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.blog.create({
                        data: {
                            title: title,
                            description: description,
                            image: image,
                            adminId: adminId
                        }
                    })];
            case 2:
                result = _b.sent();
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.put("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, image, id, user, blogExist, blog;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, title = _a.title, description = _a.description, image = _a.image, id = _a.id;
                return [4 /*yield*/, authentication_1.getUserId(req)];
            case 1:
                user = _b.sent();
                if (user === null || user.message) {
                    res.send(JSON.stringify({
                        status: 401,
                        error: "JWT expired or not provided",
                        response: null
                    }));
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.blog.findFirst({
                        where: {
                            id: id
                        }
                    })];
            case 2:
                blogExist = _b.sent();
                if (!blogExist) {
                    return [2 /*return*/, res.status(400).json({
                            msg: "blog does not exists"
                        })];
                }
                return [4 /*yield*/, prisma.blog.update({
                        where: { id: id },
                        data: { title: title, description: description, image: image }
                    })];
            case 3:
                blog = _b.sent();
                res.json(blog);
                return [2 /*return*/];
        }
    });
}); });
router["delete"]("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, blogExist, blog;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.id;
                return [4 /*yield*/, prisma.blog.findFirst({
                        where: {
                            id: id
                        }
                    })];
            case 1:
                blogExist = _a.sent();
                if (!blogExist) {
                    return [2 /*return*/, res.status(400).json({
                            msg: "blog does not exists"
                        })];
                }
                return [4 /*yield*/, prisma.blog["delete"]({
                        where: {
                            id: id
                        }
                    })];
            case 2:
                blog = _a.sent();
                res.json(blog);
                return [2 /*return*/];
        }
    });
}); });
module.exports = router;
//# sourceMappingURL=blog.js.map