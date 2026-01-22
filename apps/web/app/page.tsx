"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        widows: "100vh",
      }}
    >
      <input
        style={{
          padding: "10px",
        }}
        type="text"
        placeholder="Room Id"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button
        style={{
          padding: "10px",
        }}
        onClick={() => router.push(`/room/${roomId}`)}
      >
        Join room
      </button>
    </div>
  );
}
