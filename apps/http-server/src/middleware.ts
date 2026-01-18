import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/server-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const autHeader = req.headers.authorization;
    const token = autHeader?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" }) as JwtPayload;
    }

    //@ts-ignore
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //@ts-ignore
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    res.json({
      message: "Invalid or expired token",
    });
  }
};
