import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { UserRole } from "../models/User";
import { config } from "../config/config";

// Get JWT configuration from environment variables
const JWT_SECRET = config.JWT_SECRET as Secret;
// const JWT_ACCESS_EXPIRATION = config.JWT_ACCESS_EXPIRATION || "1h";
// const JWT_REFRESH_EXPIRATION = config.JWT_REFRESH_EXPIRATION || "7d";

interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

// Generate access token
export const generateAccessToken = (payload: TokenPayload): string => {
  // Explicitly type your configuration
  const secret: Secret = JWT_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: "1h",
  };
  return jwt.sign(payload, secret, options);
};

// Generate refresh token
export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret: Secret = JWT_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: "7d",
  };
  return jwt.sign(payload, secret, options);
};

// verify token
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
