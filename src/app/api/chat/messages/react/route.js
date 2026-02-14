import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/jwt";

/**
 * Add or remove emoji reaction to a message
 */
export async function POST(req) {
  try {
    // Get token from header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return Response.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 },
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Parse request body
    const { messageId, emoji } = await req.json();

    if (!messageId || !emoji) {
      return Response.json(
        { success: false, message: "Message ID and emoji are required" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return Response.json(
        { success: false, message: "Message not found" },
        { status: 404 },
      );
    }

    // Check if user already reacted with this emoji
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === decoded.userId && r.emoji === emoji,
    );

    if (existingReactionIndex !== -1) {
      // Remove reaction if it exists (toggle)
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({
        userId: decoded.userId,
        emoji,
        createdAt: new Date(),
      });
    }

    await message.save();

    // Populate sender and receiver
    await message.populate("senderId", "fullName username profilePicture");
    await message.populate("receiverId", "fullName username profilePicture");
    await message.populate("reactions.userId", "fullName username");

    return Response.json(
      {
        success: true,
        message:
          existingReactionIndex !== -1 ? "Reaction removed" : "Reaction added",
        data: { message: message.toObject() },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reaction error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to add reaction",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
