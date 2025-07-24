import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import dotenv from "dotenv";

import animeRoutes from "./routes/anime.routes";
import authRoutes from "./routes/auth.routes";
import favoriteRoutes from "./routes/favorite.routes";
import ratingRoutes from "./routes/rating.routes";

dotenv.config();

const app = express();
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

app.use("/api/animes", animeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/ratings", ratingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});

export default serverless(app);
