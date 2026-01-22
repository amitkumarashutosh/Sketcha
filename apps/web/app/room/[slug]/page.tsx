import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../../components/ChatRoom";

async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
  return response.data.room.id;
}

const Room = async ({ params }: { params: Promise<{ slug: string }> }) => {
  // const { slug } = await params; OR
  const parsed = await params;
  const slug = parsed.slug;
  const roomId = await getRoomId(slug);

  return (
    <div>
      <ChatRoom id={roomId} />
    </div>
  );
};

export default Room;
