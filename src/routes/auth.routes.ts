import express from "express";
import {
  register,
  login,
  refreshToken,
  getCurrentUser,
} from "../controllers/auth.controller";
import {
  registerValidator,
  loginValidator,
  validate,
} from "../utils/validators";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.post("/register", registerValidator, validate, register);

router.post("/login", loginValidator, validate, login);

router.post("/refresh", refreshToken);

router.get("/me", authenticate, getCurrentUser);

export default router;
