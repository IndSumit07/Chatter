import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

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

    // Connect to database
    await connectDB();

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 },
      );
    }

    return Response.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get user information",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
