import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: ["http://localhost:5173", "https://anime-z1.vercel.app"],
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


app.use(express.json());

interface AuthRequest extends Request {
  userId?: string;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token ausente" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

app.post("/api/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email já cadastrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: { create: {} },
      },
      include: { profile: true },
    });

    res.status(201).json({ message: "Usuário registrado", user });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

app.get("/api/auth/profile", auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true, email: true },
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

app.post("/api/favorites/:animeId", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req;
    const { animeId } = req.params;

    const existing = await prisma.favorite.findFirst({
      where: { userId, animeId },
    });

    if (existing) {
      return res.status(400).json({ error: "Anime já favoritado" });
    }

    const favorite = await prisma.favorite.create({
      data: { userId: userId!, animeId },
    });

    res.status(201).json(favorite);
  } catch (err) {
    console.error("Erro ao favoritar:", err);
    res.status(500).json({ error: "Erro ao favoritar anime" });
    console.log("Anime ID recebido:", req.params.animeId);
    console.log("Body:", req.body);

  }
});

app.delete("/api/favorites/:animeId", auth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.favorite.delete({
      where: {
        userId_animeId: {
          userId: req.userId!,
          animeId: req.params.animeId,
        },
      },
    });
    res.json({ message: "Anime removido dos favoritos" });
  } catch {
    res.status(500).json({ error: "Erro ao remover favorito" });
  }
});

app.get("/api/favorites", auth, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      include: { anime: true },
    });
    res.json(favorites.map((fav) => fav.anime));
  } catch {
    res.status(500).json({ error: "Erro ao buscar favoritos" });
  }
});

app.post("/api/animes", auth, async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    image,
    categoryId,
    author,
    studio,
    releaseDate,
    status,
    episodesCount,
  } = req.body;

  try {
    const anime = await prisma.anime.create({
      data: {
        title,
        description,
        image,
        categoryId,
        author,
        studio,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        status,
        episodesCount,
      },
    });
    res.status(201).json(anime);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar anime" });
  }
});

app.get("/api/animes", async (req: Request, res: Response) => {
  try {
    const animes = await prisma.anime.findMany({
      include: {
        ratings: true,
      },
    });
    res.json(animes);
  } catch {
    res.status(500).json({ error: "Erro ao buscar animes" });
  }
});


app.get("/api/animes/:id", async (req: Request, res: Response) => {
  try {
    const anime = await prisma.anime.findUnique({ where: { id: req.params.id } });
    if (!anime) return res.status(404).json({ error: "Anime não encontrado" });
    res.json(anime);
  } catch {
    res.status(500).json({ error: "Erro ao buscar anime" });
  }
});

app.put("/api/animes/:id", auth, async (req: AuthRequest, res: Response) => {
  const { title, description, image } = req.body;
  try {
    const anime = await prisma.anime.update({
      where: { id: req.params.id },
      data: { title, description, image },
    });
    res.json(anime);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar anime" });
  }
});

app.delete("/api/animes/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.anime.delete({ where: { id: req.params.id } });
    res.json({ message: "Anime deletado" });
  } catch {
    res.status(500).json({ error: "Erro ao deletar anime" });
  }
});

app.post("/api/categories", auth, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  try {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ error: "Categoria já existe" });

    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch {
    res.status(500).json({ error: "Erro ao criar categoria" });
  }
});

app.get("/api/categories", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch {
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
});

app.get("/api/ratings/top10", async (req, res) => {
  try {
    const topRated = await prisma.rating.groupBy({
      by: ["animeId"],
      _avg: { score: true },
      _count: { score: true },
      orderBy: [
        { _avg: { score: "desc" } },
        { animeId: "asc" }
      ],
      take: 10,
    });

    const animeIds = topRated.map((item) => item.animeId);
    const animes = await prisma.anime.findMany({
      where: { id: { in: animeIds } },
    });

    const response = topRated.map((rating) => {
      const anime = animes.find((a) => a.id === rating.animeId);
      return {
        anime,
        average: rating._avg.score,
        totalRatings: rating._count.score,
      };
    });

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar top 10:", error);
    res.status(500).json({ error: "Erro ao buscar top 10 animes" });
  }
});

app.post("/api/ratings", auth, async (req: AuthRequest, res: Response) => {
  const { animeId, score } = req.body;

  if (!animeId || typeof score !== "number" || score < 1 || score > 5) {
    return res.status(400).json({ error: "Dados inválidos: animeId e score (1-5) são obrigatórios" });
  }

  try {
    // Verifica se o usuário já avaliou esse anime
    const existingRating = await prisma.rating.findFirst({
      where: {
        userId: req.userId!,
        animeId,
      },
    });

    let rating;
    if (existingRating) {
      // Atualiza avaliação existente
      rating = await prisma.rating.update({
        where: {
          id: existingRating.id,
        },
        data: {
          score,
        },
      });
    } else {
      // Cria nova avaliação
      rating = await prisma.rating.create({
        data: {
          userId: req.userId!,
          animeId,
          score,
        },
      });
    }

    res.status(201).json(rating);
  } catch (err) {
    console.error("Erro ao avaliar anime:", err);
    res.status(500).json({ error: "Erro ao avaliar anime" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
