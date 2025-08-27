import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "TodoBoard API",
    version: "1.0.0",
    description: "일정 관리 시스템 API 문서",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 4000}/api`,
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "session_id" },
    },
  },
  security: [{ cookieAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ["src/routes/*.ts"], // API 문서화할 파일 경로
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
