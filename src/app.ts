import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { config } from "./config/config";

const PORT = config.PORT || 3000;

// import routes

// import middlewares

const app = express();

connectDB();

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.NODE_ENV === "development" ? "dev" : "combined"));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Grading Hub API",
      version: "1.0.0",
      description:
        "REST API for collecting, grading, and providing feedback on programming tasks submitted by students",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development Server",
      },
    ],
    components: {
      securitySchemas: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes

// Serve static files for PDF uploads (only when authorized)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Error Handling

export default app;
