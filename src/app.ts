import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { connectDB } from "./config/db";
import { config } from "./config/config";

const PORT = config.PORT || 3000;

// import routes
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import submissionRoutes from './routes/submission.routes';

// import middlewares
import { errorHandler, notFound } from "./middlewares/error";


const app = express();

// connect to mongodb
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
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes)

// Serve static files for PDF uploads (only when authorized)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Error Handling
app.use(notFound)
app.use(errorHandler)

export default app;
