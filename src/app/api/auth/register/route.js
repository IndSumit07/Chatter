import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    // Parse request body
    const { fullName, username, email, password } = await req.json();

    // Validate input
    if (!fullName || !username || !email || !password) {
      return Response.json(
        {
          success: false,
          message:
            "Please provide all required fields: fullName, username, email, and password",
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

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return Response.json(
        {
          success: false,
          message:
            "Username can only contain letters, numbers, and underscores",
        },
        { status: 400 },
      );
    }

    // Validate username length
    if (username.length < 3 || username.length > 30) {
      return Response.json(
        {
          success: false,
          message: "Username must be between 3 and 30 characters",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return Response.json(
          {
            success: false,
            message: "Email already registered",
          },
          { status: 400 },
        );
      }
      if (existingUser.username === username.toLowerCase()) {
        return Response.json(
          {
            success: false,
            message: "Username already taken",
          },
          { status: 400 },
        );
      }
    }

    // Create new user
    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response
    return Response.json(
      {
        success: true,
        message: "Account created successfully",
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
          },
          token,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return Response.json(
        {
          success: false,
          message: messages[0] || "Validation error",
        },
        { status: 400 },
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return Response.json(
        {
          success: false,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        success: false,
        message: "Registration failed. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
