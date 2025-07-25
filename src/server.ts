import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// =========================
// 🔐 Tipagem personalizada
// =========================
interface AuthRequest extends Request {
  userId?: string;
}

// =========================
// 🔐 Middleware de autenticação
// =========================
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

// =========================
// 👤 Registro
// =========================
app.post("/api/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email já cadastrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ message: "Usuário registrado", user });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

// =========================
// 🔐 Login
// =========================
app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
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

// =========================
// 🎬 CRUD de Animes
// =========================

// 📥 Criar anime (protegido)
app.post("/api/animes", auth, async (req: AuthRequest, res: Response) => {
  const { title, description, image } = req.body;
  try {
    const anime = await prisma.anime.create({
      data: { title, description, image },
    });
    res.status(201).json(anime);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar anime" });
  }
});

// 📄 Listar todos os animes
app.get("/api/animes", async (req: Request, res: Response) => {
  try {
    const animes = await prisma.anime.findMany();
    res.json(animes);
  } catch {
    res.status(500).json({ error: "Erro ao buscar animes" });
  }
});

// 🔍 Buscar anime por ID
app.get("/api/animes/:id", async (req: Request, res: Response) => {
  try {
    const anime = await prisma.anime.findUnique({ where: { id: req.params.id } });
    if (!anime) return res.status(404).json({ error: "Anime não encontrado" });
    res.json(anime);
  } catch {
    res.status(500).json({ error: "Erro ao buscar anime" });
  }
});

// ✏️ Atualizar anime (protegido)
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

// ❌ Deletar anime (protegido)
app.delete("/api/animes/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.anime.delete({ where: { id: req.params.id } });
    res.json({ message: "Anime deletado" });
  } catch {
    res.status(500).json({ error: "Erro ao deletar anime" });
  }
});

// =========================
// 🚀 Start server
// =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
