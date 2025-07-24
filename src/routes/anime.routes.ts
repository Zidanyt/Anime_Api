import { Router } from "express";
import { prisma } from "../prisma/client";

const router = Router();

// GET /api/animes
router.get("/", async (req, res) => {
  console.log("🔍 Buscando animes...");
  try {
    const animes = await prisma.anime.findMany({
      take: 1,
      include: {
        ratings: true,
        category: true,
      },
    });
    console.log("✅ Animes encontrados:", animes.length);
    res.json(animes);
  } catch (error) {
    console.error("❌ Erro ao buscar animes:", error);
    res.status(500).json({ error: "Erro ao buscar animes", details: error });
  }
});



// GET /api/animes/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const anime = await prisma.anime.findUnique({
    where: { id },
    include: { ratings: true, category: true },
  });

  if (!anime) return res.status(404).json({ error: "Anime não encontrado." });
  res.json(anime);
});

// POST /api/animes
router.post("/", async (req, res) => {
  const {
    title,
    description,
    image,
    author,
    studio,
    releaseDate,
    status,
    episodesCount,
    categoryId,
  } = req.body;

  if (!title || !description || !image) {
    return res.status(400).json({ error: "Título, descrição e imagem são obrigatórios." });
  }

  try {
    const newAnime = await prisma.anime.create({
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
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar anime.", details: err });
  }
});

// PUT /api/animes/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    image,
    author,
    studio,
    releaseDate,
    status,
    episodesCount,
    categoryId,
  } = req.body;

  try {
    const updatedAnime = await prisma.anime.update({
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
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar anime.", details: err });
  }
});

// DELETE /api/animes/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.anime.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar anime.", details: err });
  }
});

export default router;
