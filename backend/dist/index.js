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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const shortid_1 = __importDefault(require("shortid"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const mongoUrl = process.env.MONGO_URI;
if (!mongoUrl) {
    throw new Error("MONGO_URI environment variable is not defined");
}
mongoose_1.default.connect(mongoUrl);
console.log("Connected to MongoDB");
const urlSchema = new mongoose_1.default.Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
    },
});
const Url = mongoose_1.default.model("Url", urlSchema);
app.post("/api/shorten", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { originalUrl } = req.body;
    const shortUrl = shortid_1.default.generate();
    const newUrl = new Url({ originalUrl, shortUrl });
    yield newUrl.save();
    res.status(201).json({ originalUrl, shortUrl });
}));
app.get("/:shortUrl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortUrl } = req.params;
    const url = yield Url.findOne({ shortUrl });
    if (!url) {
        return res.status(404).json({ error: "URL not found" });
    }
    res.redirect(url.originalUrl);
}));
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
