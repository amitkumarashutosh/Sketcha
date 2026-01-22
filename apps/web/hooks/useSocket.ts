import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWtqc3diNTIwMDAwcDVxY24wdnQ5YWhtIiwiaWF0IjoxNzY4ODA1NzYxfQ.VYtYr3l6LjZckKOwH7KQ2siLKZ1-644v_zk4-p_MVWQ`
    );
    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };
  }, []);

  return { socket, loading };
}
