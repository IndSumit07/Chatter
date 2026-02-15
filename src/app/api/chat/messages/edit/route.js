import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/jwt";

/**
 * Edit a message
 */
export async function PUT(req) {
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
    const { messageId, newContent } = await req.json();

    if (!messageId || !newContent) {
      return Response.json(
        { success: false, message: "Message ID and new content are required" },
        { status: 400 },
      );
    }

    if (newContent.trim().length === 0) {
      return Response.json(
        { success: false, message: "Message content cannot be empty" },
        { status: 400 },
      );
    }

    if (newContent.length > 5000) {
      return Response.json(
        { success: false, message: "Message cannot exceed 5000 characters" },
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

    // Only sender can edit their own message
    if (message.senderId.toString() !== decoded.userId) {
      return Response.json(
        { success: false, message: "You can only edit your own messages" },
        { status: 403 },
      );
    }

    // Check if message was deleted
    if (message.deletedBy.includes(decoded.userId)) {
      return Response.json(
        { success: false, message: "Cannot edit a deleted message" },
        { status: 400 },
      );
    }

    const oldContent = message.content;
    const wasImage = message.type === "image";

    // Update message
    message.content = newContent.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    // If it was an image and is being replaced (logic assumes newContent is new URL)
    // In our frontend impl, we only call editMessage with URL if type was image
    if (
      wasImage &&
      message.senderId.toString() === decoded.userId &&
      oldContent !== newContent
    ) {
      try {
        const { deleteImage } = await import("@/lib/cloudinary");
        await deleteImage(oldContent);
      } catch (err) {
        console.error("Failed to delete old image:", err);
      }
    }

    // Populate sender and receiver
    await message.populate("senderId", "fullName username profilePicture");
    await message.populate("receiverId", "fullName username profilePicture");

    return Response.json(
      {
        success: true,
        message: "Message edited successfully",
        data: { message: message.toObject() },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Edit message error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to edit message",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
