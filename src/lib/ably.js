import Ably from "ably";

let ablyClientInstance = null;

/**
 * Get Ably client instance (singleton)
 */
export function getAblyClient() {
  if (typeof window === "undefined") {
    // Server-side: Use API key
    if (!ablyClientInstance) {
      ablyClientInstance = new Ably.Realtime({
        key: process.env.ABLY_API_KEY,
      });
    }
  } else {
    // Client-side: Use public key or token
    if (!ablyClientInstance) {
      const publicKey = process.env.NEXT_PUBLIC_ABLY_PUBLIC_KEY;
      if (publicKey) {
        ablyClientInstance = new Ably.Realtime({
          key: publicKey,
        });
      }
    }
  }

  return ablyClientInstance;
}

/**
 * Create a chat room channel name
 */
export function getChatRoomId(userId1, userId2) {
  // Sort user IDs to ensure consistent room ID regardless of order
  const [id1, id2] = [userId1.toString(), userId2.toString()].sort();
  return `chat:${id1}:${id2}`;
}

/**
 * Get Ably channel for a chat room
 */
export function getChatChannel(roomId) {
  const client = getAblyClient();
  return client?.channels.get(roomId);
}

export default getAblyClient;
