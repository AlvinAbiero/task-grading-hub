import { Request, Response, NextFunction } from "express";
import User, { IUser, UserRole } from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { AppError } from "../middlewares/error";

export const reqister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    // Only allow admin role if explicitly permitted(e.g,., first user or admin creating another admin)
    const userRole =
      role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.STUDENT;

    const user = new User({
      name,
      email,
      password,
      role: userRole,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = (await User.findOne({ email })) as IUser;
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Inavlid email or password", 401);
    }

    // Generate tokens
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
