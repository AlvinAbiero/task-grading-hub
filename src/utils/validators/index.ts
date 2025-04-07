import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["student", "admin"])
    .withMessage("Role must be either student or admin"),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid")
    .normalizeEmail(),

  body("password").trim().notEmpty().withMessage("Password is required"),
];

export const taskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 charcters"),

  body("description").trim().notEmpty().withMessage("Description is required"),

  body("deadline")
    .notEmpty()
    .withMessage("Deadline is required")
    .isISO8601()
    .withMessage("Deadline must be a valid date")
    .custom((value) => {
      const deadline = new Date(value);
      if (deadline <= new Date()) {
        throw new Error("Deadline must be in the future");
      }
      return true;
    }),
];

export const gradeValidator = [
  param("submissionId").isMongoId().withMessage("Inavlid submission ID"),

  body("grade")
    .isNumeric()
    .withMessage("Grade must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Grade must be between 0 and 100"),

  body("feedback")
    .optional()
    .isString()
    .withMessage("Feedback must be a string"),
];

export const idValidator = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];

export const taskIdValidator = [
  param("taskId").isMongoId().withMessage("Inavlid task ID format"),
];

export const submissionIdValidator = [
  param("submissionId").isMongoId().withMessage("Inavlid submission ID format"),
];

export const studentIdValidator = [
  param("studentId").isMongoId().withMessage("Inavlid student ID format"),
];
