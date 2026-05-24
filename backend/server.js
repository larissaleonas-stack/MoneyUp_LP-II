import express from "express";
import cors from "cors";
import morgan from "morgan";

import gastoRoutes from "./routes/gastoRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/gastos", gastoRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});