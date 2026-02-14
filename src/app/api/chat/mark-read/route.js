import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/jwt";

/**
 * Mark messages as read
 */
export async function PUT(req) {
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

    // Parse request body
    const { chatRoomId } = await req.json();

    if (!chatRoomId) {
      return Response.json(
        {
          success: false,
          message: "Chat room ID is required",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Mark all messages in this chat room as read by the current user
    const result = await Message.updateMany(
      {
        chatRoomId,
        receiverId: decoded.userId,
        readBy: { $ne: decoded.userId },
      },
      {
        $addToSet: { readBy: decoded.userId },
      },
    );

    return Response.json(
      {
        success: true,
        message: "Messages marked as read",
        data: {
          modifiedCount: result.modifiedCount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Mark as read error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to mark messages as read",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
