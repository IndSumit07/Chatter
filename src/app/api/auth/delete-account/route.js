import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function DELETE(req) {
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

    // Parse request body to get password confirmation
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return Response.json(
        {
          success: false,
          message: "Please provide your password to confirm account deletion",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Get user with password
    const user = await User.findById(decoded.userId).select("+password");

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return Response.json(
        {
          success: false,
          message: "Invalid password. Account deletion cancelled.",
        },
        { status: 401 },
      );
    }

    // Delete user account and all associated data
    await User.findByIdAndDelete(decoded.userId);

    // TODO: Delete additional user data if you have related collections
    // For example:
    // await Message.deleteMany({ userId: decoded.userId });
    // await FriendRequest.deleteMany({ $or: [{ from: decoded.userId }, { to: decoded.userId }] });
    // await ChatRoom.updateMany({}, { $pull: { members: decoded.userId } });

    return Response.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete account. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
