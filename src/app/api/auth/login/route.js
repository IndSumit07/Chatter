import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    // Parse request body
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return Response.json(
        {
          success: false,
          message: "Please provide email and password",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response
    return Response.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
          },
          token,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      {
        success: false,
        message: "Login failed. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
