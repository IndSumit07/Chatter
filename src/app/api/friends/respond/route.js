import connectDB from "@/lib/mongodb";
import FriendRequest from "@/models/FriendRequest";
import { verifyToken } from "@/lib/jwt";

/**
 * Accept or reject a friend request
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
    const { requestId, action } = await req.json();

    if (!requestId || !action) {
      return Response.json(
        { success: false, message: "Request ID and action are required" },
        { status: 400 },
      );
    }

    if (!["accept", "reject"].includes(action)) {
      return Response.json(
        { success: false, message: "Action must be 'accept' or 'reject'" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Find the friend request
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      to: decoded.userId,
      status: "pending",
    });

    if (!friendRequest) {
      return Response.json(
        { success: false, message: "Friend request not found" },
        { status: 404 },
      );
    }

    // Update status
    friendRequest.status = action === "accept" ? "accepted" : "rejected";
    await friendRequest.save();

    await friendRequest.populate("from", "fullName username profilePicture");
    await friendRequest.populate("to", "fullName username profilePicture");

    return Response.json(
      {
        success: true,
        message: `Friend request ${action}ed successfully`,
        data: { friendRequest },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Respond to friend request error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to respond to friend request",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
