import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/server-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //@ts-ignore
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.json({
      message: "Something went wrong!",
    });
  }
};
