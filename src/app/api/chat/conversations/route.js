import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

/**
 * Get list of conversations for the current user
 */
export async function GET(req) {
  try {
    // Get token from header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "No authentication token provided",
        },
        { status: 401 },
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 },
      );
    }

    // Connect to database
    await connectDB();

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: decoded.userId }, { receiverId: decoded.userId }],
      deletedBy: { $ne: decoded.userId },
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "fullName username profilePicture")
      .populate("receiverId", "fullName username profilePicture")
      .lean();

    // Group by conversation partner
    const conversationsMap = new Map();

    for (const message of messages) {
      // Determine the other user in the conversation
      const otherUser =
        message.senderId._id.toString() === decoded.userId.toString()
          ? message.receiverId
          : message.senderId;

      const otherUserId = otherUser._id.toString();

      // Only keep the most recent message for each conversation
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: {
            _id: message._id,
            content: message.content,
            type: message.type,
            createdAt: message.createdAt,
            senderId: message.senderId._id,
            isMine:
              message.senderId._id.toString() === decoded.userId.toString(),
          },
          chatRoomId: message.chatRoomId,
          unreadCount: 0,
        });
      }
    }

    // Calculate unread counts
    for (const [userId, conversation] of conversationsMap) {
      const unreadCount = await Message.countDocuments({
        chatRoomId: conversation.chatRoomId,
        receiverId: decoded.userId,
        readBy: { $ne: decoded.userId },
      });
      conversation.unreadCount = unreadCount;
    }

    // Convert to array and sort by last message time
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt),
    );

    return Response.json(
      {
        success: true,
        data: {
          conversations,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get conversations error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch conversations",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
