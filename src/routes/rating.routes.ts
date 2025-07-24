type Rating = {
  score: number;
};

type AnimeWithRatings = {
  title: string;
  ratings: Rating[];
  [key: string]: any;
};

import { Router, Request, Response } from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/ratings/:animeId
router.post("/:animeId", protect, async (req: Request, res: Response) => {
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
    const rating = await prisma.rating.upsert({
      where: { userId_animeId: { userId, animeId } },
      update: { score },
      create: { userId, animeId, score },
    });

    res.json(rating);
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar nota.", details: error });
  }
});

// GET /api/ratings/top10
router.get("/top10", async (req: Request, res: Response) => {
  try {
    const animes = await prisma.anime.findMany({
      include: {
        ratings: true,
      },
    });

const scored = animes
  .map((anime: AnimeWithRatings) => {
    const avg = anime.ratings.reduce(
      (acc: number, r: Rating) => acc + r.score,
      0
    ) / (anime.ratings.length || 1);
    return { ...anime, average: avg };
  })
  .sort((a: any, b: any) =>
    b.average !== a.average
      ? b.average - a.average
      : a.title.localeCompare(b.title)
  )
  .slice(0, 10);


    res.json(scored);
  } catch (error) {
    res.status(500).json({ error: "Erro ao calcular top 10.", details: error });
  }
});

export default router;
