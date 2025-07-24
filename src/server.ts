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

// ⛔️ O favicon gera erro no Vercel, então ignoramos
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ✅ Configurar CORS corretamente
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://anime-api-alpha-red.vercel.app/",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ Middleware para tratar OPTIONS globalmente
app.options("*", cors());

app.use(express.json());

// ✅ Rotas
app.use("/api/animes", animeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/ratings", ratingRoutes);

// ✅ Exporta como função serverless
export default serverless(app);



// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server rodando na porta ${PORT}`);
// // });