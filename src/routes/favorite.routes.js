"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../prisma/client");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/:animeId", auth_middleware_1.protect, async (req, res) => {
    const { animeId } = req.params;
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ message: "Usuário não autenticado." });
    const existing = await client_1.prisma.favorite.findFirst({ where: { userId, animeId } });
    if (existing)
        return res.status(400).json({ message: "Anime já favoritado" });
    const favorite = await client_1.prisma.favorite.create({ data: { userId, animeId } });
    res.status(201).json(favorite);
});
router.delete("/:animeId", auth_middleware_1.protect, async (req, res) => {
    const { animeId } = req.params;
    const userId = req.userId;
    await client_1.prisma.favorite.deleteMany({ where: { userId, animeId } });
    res.status(204).send();
});
// Listar favoritos do usuário (somente IDs)
router.get("/", auth_middleware_1.protect, async (req, res) => {
    const userId = req.userId;
    const favorites = await client_1.prisma.favorite.findMany({
        where: { userId },
        select: { animeId: true },
    });
    const animeIds = favorites.map(f => f.animeId);
    res.json({ favorites, animeIds });
});
exports.default = router;
