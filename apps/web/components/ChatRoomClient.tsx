"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
  messages,
  id,
}: {
  messages: { message: string }[];
  id: string;
}) {
  const [chats, setChats] = useState(messages);
  const { socket, loading } = useSocket();
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (!socket || loading) return;

    socket.send(
      JSON.stringify({
        type: "join_room",
        roomId: id,
      })
    );

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === "chat") {
        setChats((c) => [...c, { message: parsedData.message }]);
      }
    };
    return () => socket?.close();
  }, [socket, loading, id]);

  return (
    <div>
      {chats.map((m) => {
        return <p>{m.message}</p>;
      })}
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
      />
      <button
        onClick={() => {
          socket?.send(
            JSON.stringify({
              type: "chat",
              roomId: id,
              message: currentMessage,
            })
          );
          setCurrentMessage("");
        }}
      >
        Send Message
      </button>
    </div>
  );
}
