import connectDB from "@/lib/mongodb";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

/**
 * Send a friend request
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
    const { userId, message } = await req.json();

    if (!userId) {
      return Response.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    // Can't send request to yourself
    if (userId === decoded.userId) {
      return Response.json(
        {
          success: false,
          message: "You cannot send a friend request to yourself",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Check if already friends (accepted request exists)
    const existingFriendship = await FriendRequest.findOne({
      $or: [
        { from: decoded.userId, to: userId, status: "accepted" },
        { from: userId, to: decoded.userId, status: "accepted" },
      ],
    });

    if (existingFriendship) {
      return Response.json(
        { success: false, message: "You are already friends" },
        { status: 400 },
      );
    }

    // Check if pending request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: decoded.userId, to: userId, status: "pending" },
        { from: userId, to: decoded.userId, status: "pending" },
      ],
    });

    if (existingRequest) {
      return Response.json(
        { success: false, message: "Friend request already pending" },
        { status: 400 },
      );
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      from: decoded.userId,
      to: userId,
      message: message?.trim() || "",
    });

    await friendRequest.populate("from", "fullName username profilePicture");
    await friendRequest.populate("to", "fullName username profilePicture");

    return Response.json(
      {
        success: true,
        message: "Friend request sent successfully",
        data: { friendRequest },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Send friend request error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return Response.json(
        { success: false, message: "Friend request already exists" },
        { status: 400 },
      );
    }

    return Response.json(
      {
        success: false,
        message: "Failed to send friend request",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Get pending friend requests (received)
 */
export async function GET(req) {
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

    // Connect to database
    await connectDB();

    // Get pending requests received by current user
    const requests = await FriendRequest.find({
      to: decoded.userId,
      status: "pending",
    })
      .populate("from", "fullName username profilePicture email")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(
      {
        success: true,
        data: { requests },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get friend requests error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch friend requests",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
