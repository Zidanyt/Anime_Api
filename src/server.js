"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const dotenv_1 = __importDefault(require("dotenv"));
const anime_routes_1 = __importDefault(require("./routes/anime.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const rating_routes_1 = __importDefault(require("./routes/rating.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"],
    credentials: true
}));
app.use(express_1.default.json());
app.use("/api/animes", anime_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/favorites", favorite_routes_1.default);
app.use("/api/ratings", rating_routes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server rodando na porta ${PORT}`);
});
exports.handler = (0, serverless_http_1.default)(app);
