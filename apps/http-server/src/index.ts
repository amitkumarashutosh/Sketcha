import express from "express";
import { JWT_SECRET } from "@repo/server-common/config";
import { middleware } from "./middleware";
import bcrypt from "bcrypt";
import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { prisma } from "@repo/db/client";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;

app.post("/signup", async (req, res) => {
  try {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message,
      });
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exist!" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    return res.status(201).json({
      message: "Account created successfully",
      userId: user.id,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const parsed = SignInSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message,
      });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Invalid authorization!" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    return res.status(200).json({ message: "Login successfully", token });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/room", middleware, async (req, res) => {
  try {
    const parsed = CreateRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.json({ message: parsed.error.issues[0]?.message });
    }
    //@ts-ignore
    const userId = req.userId;
    const { name } = parsed.data;

    const isRoomPresent = await prisma.room.findUnique({
      where: {
        slug: name,
      },
    });
    if (isRoomPresent) {
      return res.status(409).json({ message: "Room already exist" });
    }

    const room = await prisma.room.create({
      data: { slug: name, adminId: userId },
    });

    res
      .status(200)
      .json({ message: "Room created successfully", roomId: room.id });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const messages = await prisma.chat.findMany({
      where: { roomId: roomId },
      orderBy: { id: "desc" },
      take: 50,
    });

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/room/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const room = await prisma.room.findFirst({
      where: {
        slug,
      },
    });

    return res.status(200).json({ room });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "System health! OK",
  });
});

app.listen(port, () => console.log(`App listening on port ${port}`));
