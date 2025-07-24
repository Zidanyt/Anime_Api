"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../prisma/client");
const router = (0, express_1.Router)();
// GET /api/animes
router.get("/", async (req, res) => {
    const animes = await client_1.prisma.anime.findMany({
        include: {
            ratings: true,
            category: true,
        },
    });
    res.json(animes);
});
// GET /api/animes/:id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const anime = await client_1.prisma.anime.findUnique({
        where: { id },
        include: { ratings: true, category: true },
    });
    if (!anime)
        return res.status(404).json({ error: "Anime não encontrado." });
    res.json(anime);
});
// POST /api/animes
router.post("/", async (req, res) => {
    const { title, description, image, author, studio, releaseDate, status, episodesCount, categoryId, } = req.body;
    if (!title || !description || !image) {
        return res.status(400).json({ error: "Título, descrição e imagem são obrigatórios." });
    }
    try {
        const newAnime = await client_1.prisma.anime.create({
            data: {
                title,
                description,
                image,
                author,
                studio,
                releaseDate: releaseDate ? new Date(releaseDate) : undefined,
                status,
                episodesCount,
                categoryId,
            },
        });
        res.status(201).json(newAnime);
    }
    catch (err) {
        res.status(500).json({ error: "Erro ao criar anime.", details: err });
    }
});
// PUT /api/animes/:id
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, description, image, author, studio, releaseDate, status, episodesCount, categoryId, } = req.body;
    try {
        const updatedAnime = await client_1.prisma.anime.update({
            where: { id },
            data: {
                title,
                description,
                image,
                author,
                studio,
                releaseDate: releaseDate ? new Date(releaseDate) : undefined,
                status,
                episodesCount,
                categoryId,
            },
        });
        res.json(updatedAnime);
    }
    catch (err) {
        res.status(500).json({ error: "Erro ao atualizar anime.", details: err });
    }
});
// DELETE /api/animes/:id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await client_1.prisma.anime.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: "Erro ao deletar anime.", details: err });
    }
});
exports.default = router;
