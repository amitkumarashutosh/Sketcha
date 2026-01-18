import express from "express";
import { JWT_SECRET } from "@repo/server-common/config";
import { middleware } from "./middleware";
import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/types";

const app = express();
const port = process.env.PORT || 3001;

app.post("/signup", (req, res) => {
  const data = CreateUserSchema.safeParse(req.body);
  if (!data.success) {
    return res.json({ message: "Incorrect inputs" });
  }

  res.status(201).json({ message: "Account created sucessfully" });
});

app.post("/signin", (req, res) => {
  const data = SignInSchema.safeParse(req.body);
  if (!data.success) {
    return res.json({ message: "Incorrect inputs" });
  }

  res.status(200).json({ message: "Login sucessfully" });
});

app.post("/room", middleware, (req, res) => {
  const data = CreateRoomSchema.safeParse(req.body);
  if (!data.success) {
    return res.json({ message: "Incorrect inputs" });
  }

  res.status(200).json({ message: "Room joined successfully" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "System health! OK",
  });
});

app.listen(port, () => console.log(`App listening on port ${port}`));
