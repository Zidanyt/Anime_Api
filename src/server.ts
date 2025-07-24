import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import animeRoutes from "./routes/anime.routes";
import authRoutes from "./routes/auth.routes";
import favoriteRoutes from "./routes/favorite.routes";
import ratingRoutes from "./routes/rating.routes";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*", // ou ['http://localhost:5173'] se quiser restringir
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/favicon.ico", (_, res) => res.status(204).end());

app.use("/api/animes", animeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/ratings", ratingRoutes);

export default app;
