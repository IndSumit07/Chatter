import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import FriendRequest from "@/models/FriendRequest";
import { verifyToken } from "@/lib/jwt";

/**
 * Search for users to add as friends
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

    // Get search query
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return Response.json(
        {
          success: false,
          message: "Search query must be at least 2 characters",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Search for users by username or email
    const users = await User.find({
      _id: { $ne: decoded.userId }, // Exclude current user
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
      ],
    })
      .select("fullName username email profilePicture")
      .limit(10)
      .lean();

    // Get existing friend requests to/from current user
    const friendRequests = await FriendRequest.find({
      $or: [{ from: decoded.userId }, { to: decoded.userId }],
      status: { $in: ["pending", "accepted"] },
    }).lean();

    // Create a map of user relationships
    const relationshipMap = new Map();
    for (const request of friendRequests) {
      const otherUserId =
        request.from.toString() === decoded.userId
          ? request.to.toString()
          : request.from.toString();

      relationshipMap.set(otherUserId, {
        status: request.status,
        direction:
          request.from.toString() === decoded.userId ? "sent" : "received",
        requestId: request._id,
      });
    }

    // Add relationship status to users
    const usersWithStatus = users.map((user) => {
      const userId = user._id.toString();
      const relationship = relationshipMap.get(userId);

      return {
        ...user,
        relationship: relationship || null,
      };
    });

    return Response.json(
      {
        success: true,
        data: { users: usersWithStatus },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Search users error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to search users",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
