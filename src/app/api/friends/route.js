import connectDB from "@/lib/mongodb";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

/**
 * Get list of friends (accepted friend requests)
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

    // Get accepted friend requests where user is either sender or receiver
    const friendRequests = await FriendRequest.find({
      $or: [{ from: decoded.userId }, { to: decoded.userId }],
      status: "accepted",
    })
      .populate("from", "fullName username profilePicture email")
      .populate("to", "fullName username profilePicture email")
      .sort({ updatedAt: -1 })
      .lean();

    // Extract friend user objects
    const friends = friendRequests.map((request) => {
      const friend =
        request.from._id.toString() === decoded.userId
          ? request.to
          : request.from;

      return {
        ...friend,
        friendshipId: request._id,
        friendsSince: request.updatedAt,
      };
    });

    return Response.json(
      {
        success: true,
        data: { friends },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get friends error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch friends",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Remove a friend
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
    const { userId } = await req.json();

    if (!userId) {
      return Response.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Find and delete the friend request
    const result = await FriendRequest.findOneAndDelete({
      $or: [
        { from: decoded.userId, to: userId, status: "accepted" },
        { from: userId, to: decoded.userId, status: "accepted" },
      ],
    });

    if (!result) {
      return Response.json(
        { success: false, message: "Friendship not found" },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Friend removed successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Remove friend error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to remove friend",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
