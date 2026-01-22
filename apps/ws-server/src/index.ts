import { WebSocket, WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/server-common/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

// use map here
const users: User[] = [];

const validateUser = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (typeof decoded == "string") return null;
    if (!decoded || !decoded.userId) return null;

    return decoded.userId;
  } catch (error) {
    return null;
  }
};

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = validateUser(token);
  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    const parsed = JSON.parse(data as unknown as string);

    if (parsed.type === "join_room") {
      const user = users.find((x) => x.ws == ws);
      user?.rooms.push(parsed.roomId);
    }

    if (parsed.type == "leave_room") {
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user.rooms = user?.rooms.filter((x) => x === parsed.room);
    }

    if (parsed.type === "chat") {
      const roomId = parsed.roomId;
      const message = parsed.message;

      // use redis queue for creating messages in a db
      // use background workers to reiterate the failed db calls
      // use rate limitng
      await prisma.chat.create({
        data: {
          userId,
          message,
          roomId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
            })
          );
        }
      });
    }
  });
});
