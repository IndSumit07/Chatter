import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { getChatRoomId } from "@/lib/ably";

/**
 * Get chat messages between two users
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get("receiverId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before"); // Cursor for pagination

    if (!receiverId) {
      return Response.json(
        {
          success: false,
          message: "Receiver ID is required",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return Response.json(
        {
          success: false,
          message: "Receiver not found",
        },
        { status: 404 },
      );
    }

    // Get chat room ID
    const chatRoomId = getChatRoomId(decoded.userId, receiverId);

    // Build query
    const query = {
      chatRoomId,
      deletedBy: { $ne: decoded.userId },
    };

    if (before) {
      query._id = { $lt: before };
    }

    // Get messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("senderId", "fullName username profilePicture")
      .populate("receiverId", "fullName username profilePicture")
      .lean();

    // Reverse to show oldest first
    messages.reverse();

    return Response.json(
      {
        success: true,
        data: {
          messages,
          chatRoomId,
          hasMore: messages.length === limit,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get messages error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch messages",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Send a new message
 */
export async function POST(req) {
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
    const { receiverId, content, type = "text" } = await req.json();

    // Validate input
    if (!receiverId || !content) {
      return Response.json(
        {
          success: false,
          message: "Receiver ID and content are required",
        },
        { status: 400 },
      );
    }

    if (content.trim().length === 0) {
      return Response.json(
        {
          success: false,
          message: "Message content cannot be empty",
        },
        { status: 400 },
      );
    }

    if (content.length > 5000) {
      return Response.json(
        {
          success: false,
          message: "Message cannot exceed 5000 characters",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return Response.json(
        {
          success: false,
          message: "Receiver not found",
        },
        { status: 404 },
      );
    }

    // Get sender
    const sender = await User.findById(decoded.userId);

    // Get chat room ID
    const chatRoomId = getChatRoomId(decoded.userId, receiverId);

    // Create message
    const message = await Message.create({
      chatRoomId,
      senderId: decoded.userId,
      receiverId,
      content: content.trim(),
      type,
      readBy: [decoded.userId], // Sender has already "read" their own message
    });

    // Populate sender and receiver data
    await message.populate("senderId", "fullName username profilePicture");
    await message.populate("receiverId", "fullName username profilePicture");

    // Note: The actual Ably publish will happen on the client side
    // after receiving this response to avoid server-side complexity

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
        data: {
          message: message.toObject(),
          chatRoomId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Send message error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to send message",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
