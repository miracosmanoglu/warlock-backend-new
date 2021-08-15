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
var prisma = new client_1.PrismaClient();
var router = express_1["default"].Router();
router.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, categoryId, warlockId, filteredGigs;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, categoryId = _a.categoryId, warlockId = _a.warlockId;
                return [4 /*yield*/, prisma.gig.findMany({
                        where: {
                            OR: [
                                {
                                    categoryId: categoryId
                                },
                                {
                                    warlockId: warlockId
                                },
                            ]
                        }
                    })];
            case 1:
                filteredGigs = _b.sent();
                res.json(filteredGigs);
                return [2 /*return*/];
        }
    });
}); });
router.post("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, description, price, title, duration, warlockId, categoryId, data, result, e_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, description = _a.description, price = _a.price, title = _a.title, duration = _a.duration, warlockId = _a.warlockId, categoryId = _a.categoryId;
                return [4 /*yield*/, authentication_1.getUserId(req)];
            case 1:
                data = _c.sent();
                if (data === null || data.message || ((_b = data === null || data === void 0 ? void 0 : data.user) === null || _b === void 0 ? void 0 : _b.user.role) === "CUSTOMER") {
                    res.send(JSON.stringify({
                        status: 401,
                        error: "JWT expired or not provided",
                        response: null
                    }));
                    return [2 /*return*/];
                }
                _c.label = 2;
            case 2:
                _c.trys.push([2, 4, , 5]);
                return [4 /*yield*/, prisma.gig.create({
                        data: {
                            description: description,
                            price: price,
                            title: title,
                            duration: duration,
                            warlockId: warlockId,
                            categoryId: categoryId
                        }
                    })];
            case 3:
                result = _c.sent();
                res.send(JSON.stringify({ status: 200, error: null, response: result }));
                return [3 /*break*/, 5];
            case 4:
                e_1 = _c.sent();
                res.send(JSON.stringify({ status: 500, error: "In gig " + e_1, response: null }));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
//# sourceMappingURL=gig.js.map