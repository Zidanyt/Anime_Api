import { Router } from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/:animeId", protect, async (req, res) => {
  const { animeId } = req.params;
  const { score } = req.body;

  if (!req.userId) return res.status(401).json({ message: "Usuário não autenticado." });
  if (score < 1 || score > 5) return res.status(400).json({ message: "Nota deve ser entre 1 e 5" });

  const userId = req.userId;

  const rating = await prisma.rating.upsert({
    where: { userId_animeId: { userId, animeId } },
    update: { score },
    create: { userId, animeId, score }
  });

  res.json(rating);
});


// Top 10 animes
router.get("/top10", async (req, res) => {
  const animes = await prisma.anime.findMany({
    include: {
      ratings: true
    }
  });

  const scored = animes
    .map(anime => {
      const avg =
        anime.ratings.reduce((acc, r) => acc + r.score, 0) / (anime.ratings.length || 1);
      return { ...anime, average: avg };
    })
    .sort((a, b) =>
      b.average !== a.average
        ? b.average - a.average
        : a.title.localeCompare(b.title)
    )
    .slice(0, 10);

  res.json(scored);
});

export default router;
