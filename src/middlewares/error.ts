import { Request, Response, NextFunction } from "express";

// Custom error clas
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values
  let statusCode = 500;
  let message = "Something went wrong";
  let stack = process.env.NODE_ENV === "development" ? err.stack : undefined;

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // handle Mongoose validation error
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }
  // handle Mongoose duplicate key errors
  else if ((err as any).code === 11000) {
    statusCode = 400;
    message = "Duplicate value entered";
  }
  // Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  // Handle JWT expiration
  else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // send response
  res.status(statusCode).json({
    status: "error",
    message,
    ...(stack && { stack }),
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};
