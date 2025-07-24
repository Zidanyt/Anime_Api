import { Router } from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middlewares/auth.middleware";

type FavoriteWithAnime = {
  id: string;
  userId: string;
  animeId: string;
  createdAt: Date;
  anime: {
    id: string;
    title: string;
    description: string;
    image: string;
    author?: string | null;
    studio?: string | null;
    releaseDate?: Date | null;
    status?: string | null;
    episodesCount?: number | null;
    categoryId?: string | null;
    createdAt: Date;
  };
};

const router = Router();

router.post("/:animeId", protect, async (req, res) => {
  const { animeId } = req.params;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ message: "Usuário não autenticado." });

  const existing = await prisma.favorite.findFirst({ where: { userId, animeId } });
  if (existing) return res.status(400).json({ message: "Anime já favoritado" });

  const favorite = await prisma.favorite.create({ data: { userId, animeId } });
  res.status(201).json(favorite);
});

router.delete("/:animeId", protect, async (req, res) => {
  const { animeId } = req.params;
  const userId = req.userId;

  await prisma.favorite.deleteMany({ where: { userId, animeId } });
  res.status(204).send();
});

// Listar favoritos do usuário (somente IDs)
router.get("/", protect, async (req, res) => {
  const userId = req.userId;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { animeId: true },
  });

const animeIds = favorites.map(f => f.animeId);
   res.json({ favorites, animeIds });
});

export default router;
