import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import { setupSwagger } from "./swagger";

dotenv.config();
const app = express();
app.use(express.json());
app.use(router);
const port = process.env.PORT || 3000;

setupSwagger(app);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
