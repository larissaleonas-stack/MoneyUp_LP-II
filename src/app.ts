import express from "express";
import cors from "cors";
import morgan from "morgan";

import gastoRoutes from "./routes/gastoRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import formaPagamentoRoutes from "./routes/formaPagamentoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requireJsonContentType } from "./middlewares/requireJsonContentType.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requireJsonContentType);
app.use(morgan("dev"));

app.use(gastoRoutes);
app.use(usuarioRoutes);
app.use(categoriaRoutes);
app.use(formaPagamentoRoutes);
app.use(authRoutes);

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(errorHandler);

export default app;
