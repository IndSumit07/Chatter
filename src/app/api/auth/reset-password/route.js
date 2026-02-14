import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    // Parse request body
    const { token, password } = await req.json();

    // Validate input
    if (!token || !password) {
      return Response.json(
        {
          success: false,
          message: "Please provide reset token and new password",
        },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return Response.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired reset token",
        },
        { status: 400 },
      );
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return Response.json(
      {
        success: true,
        message:
          "Password reset successful. You can now login with your new password.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to reset password. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
