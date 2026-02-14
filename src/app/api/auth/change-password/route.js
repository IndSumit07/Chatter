import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function PUT(req) {
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
    const { currentPassword, newPassword } = await req.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return Response.json(
        {
          success: false,
          message: "Please provide current password and new password",
        },
        { status: 400 },
      );
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return Response.json(
        {
          success: false,
          message: "New password must be at least 6 characters long",
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

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return Response.json(
        {
          success: false,
          message: "Current password is incorrect",
        },
        { status: 401 },
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to change password. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
