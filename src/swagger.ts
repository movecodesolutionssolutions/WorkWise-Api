import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import { Express } from "express";

export const setupSwagger = (app: Express) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
