import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/jwt";

/**
 * Delete a message (for the current user)
 */
export async function DELETE(req) {
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
    const { messageId } = await req.json();

    if (!messageId) {
      return Response.json(
        { success: false, message: "Message ID is required" },
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

    // Only sender can delete their own message
    if (message.senderId.toString() !== decoded.userId) {
      return Response.json(
        { success: false, message: "You can only delete your own messages" },
        { status: 403 },
      );
    }

    // Add user to deletedBy array (soft delete)
    if (!message.deletedBy.includes(decoded.userId)) {
      message.deletedBy.push(decoded.userId);
      await message.save();
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
        data: { messageId },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete message error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete message",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
