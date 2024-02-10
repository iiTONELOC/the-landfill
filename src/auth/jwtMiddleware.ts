import { Request, Response, NextFunction } from "express";
import { IJwtPayload } from "../types";
import jwt, { Algorithm } from "jsonwebtoken";

// our tokens are stored in localStorage anyway
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const SECRET = process.env.JWT_SECRET || "3+@71]i-nk6Al4kZ7666kM?ka8+G&mms";
const ALGORITHM =
  (process.env.JWT_ALGORITHM as Algorithm) || ("HS256" as Algorithm);

// eslint-disable-next-line
// @ts-ignore
export function jwtMiddleware(req: Request): IJwtPayload | undefined {
  try {
    let token = req.headers.authorization ?? "";

    token = token?.split(" ")?.pop()?.trim() ?? "";

    if (!token || token === "") {
      return undefined;
    }

    // we decode the token and return it if it is valid
    const decoded: IJwtPayload = jwt.verify(token, SECRET, {
      maxAge: EXPIRES_IN,
      algorithms: [ALGORITHM],
    }) as IJwtPayload;
    return decoded;
  } catch (error) {
    console.error("Error in jwtMiddleware", error);
    return undefined;
  }
}

export function jwtMiddlewareWebAuthn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = jwtMiddleware(req);
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
  } else {
    next();
  }
}

export function signToken(payload: IJwtPayload): string {
  return jwt.sign(
    {
      _id: payload._id,
      username: payload.username,
      email: payload.email,
    },
    SECRET,
    { algorithm: ALGORITHM, expiresIn: EXPIRES_IN }
  );
}
