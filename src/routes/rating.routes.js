"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../prisma/client");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/ratings/:animeId
router.post("/:animeId", auth_middleware_1.protect, async (req, res) => {
    const { animeId } = req.params;
    const { score } = req.body;
    if (!req.userId) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }
    if (score < 1 || score > 5) {
        return res.status(400).json({ message: "Nota deve ser entre 1 e 5" });
    }
    const userId = req.userId;
    try {
        const rating = await client_1.prisma.rating.upsert({
            where: { userId_animeId: { userId, animeId } },
            update: { score },
            create: { userId, animeId, score },
        });
        res.json(rating);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao registrar nota.", details: error });
    }
});
// GET /api/ratings/top10
router.get("/top10", async (req, res) => {
    try {
        const animes = await client_1.prisma.anime.findMany({
            include: {
                ratings: true,
            },
        });
        const scored = animes
            .map((anime) => {
            const avg = anime.ratings.reduce((acc, r) => acc + r.score, 0) / (anime.ratings.length || 1);
            return { ...anime, average: avg };
        })
            .sort((a, b) => b.average !== a.average
            ? b.average - a.average
            : a.title.localeCompare(b.title))
            .slice(0, 10);
        res.json(scored);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao calcular top 10.", details: error });
    }
});
exports.default = router;
