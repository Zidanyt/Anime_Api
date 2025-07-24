import cors from "cors";
import express from "express";
import dotenv from "dotenv";

import animeRoutes from "./routes/anime.routes";
import authRoutes from "./routes/auth.routes";
import favoriteRoutes from "./routes/favorite.routes";
import ratingRoutes from "./routes/rating.routes";

dotenv.config();

const app = express();

// Middleware CORS
app.use(cors({
  origin: "*", // ou ['http://localhost:5173'] para restringir
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware para interpretar JSON
app.use(express.json());

// Middleware para lidar com preflight requests manualmente
app.options("*", cors());

// Rotas
app.get("/favicon.ico", (_, res) => res.status(204).end());

app.use("/api/animes", animeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/ratings", ratingRoutes);

export default app;
