import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/User";
import { config } from "../config/config";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

const JWT_SECRET = config.JWT_SECRET;

// mIddleware to verify jwt TOKEN
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
       res.status(401).json({
        success: false,
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };

    req.user = {
      id: decodedToken.id,
      email: decodedToken.email,
      role: decodedToken.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === UserRole.ADMIN) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access forbidden: Admin rights required",
    });
  }
};

// Middleware to check if user is a student
export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === UserRole.STUDENT) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access forbidden: Student rights required",
    });
  }
};

// Middleware to check if user is student and owns the resource
export const isResourceOwner = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.user &&
    req.user.role === UserRole.STUDENT &&
    req.params.studentId === req.user.id
  ) {
    next();
  } else if (req.user && req.user.role === UserRole.ADMIN) {
    next(); // Admins can access any student's resources
  } else {
    res.status(403).json({
      success: false,
      message: "Access forbidden: You can only access your own resources",
    });
  }
};
