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
    const { fullName, username, profilePicture } = await req.json();

    // Validate input - at least one field must be provided
    if (
      fullName === undefined &&
      username === undefined &&
      profilePicture === undefined
    ) {
      return Response.json(
        {
          success: false,
          message: "Please provide at least one field to update",
        },
        { status: 400 },
      );
    }

    // Validate fullName if provided
    if (fullName !== undefined) {
      if (fullName.trim().length < 2 || fullName.trim().length > 50) {
        return Response.json(
          {
            success: false,
            message: "Full name must be between 2 and 50 characters",
          },
          { status: 400 },
        );
      }
    }

    // Validate username if provided
    if (username !== undefined) {
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

      if (username.length < 3 || username.length > 30) {
        return Response.json(
          {
            success: false,
            message: "Username must be between 3 and 30 characters",
          },
          { status: 400 },
        );
      }
    }

    // Connect to database
    await connectDB();

    // Check if username is already taken (if username is being updated)
    if (username !== undefined) {
      const existingUser = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: decoded.userId },
      });

      if (existingUser) {
        return Response.json(
          {
            success: false,
            message: "Username already taken",
          },
          { status: 400 },
        );
      }
    }

    // Build update object
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (username !== undefined) updateData.username = username.toLowerCase();
    if (profilePicture !== undefined)
      updateData.profilePicture = profilePicture;

    // Check for old profile picture if updating
    let oldProfilePicture = null;
    if (profilePicture !== undefined) {
      const currentUser = await User.findById(decoded.userId);
      if (currentUser) oldProfilePicture = currentUser.profilePicture;
    }

    // Update user
    const user = await User.findByIdAndUpdate(decoded.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    // Delete old profile picture if it was updated and existed
    if (
      user &&
      oldProfilePicture &&
      oldProfilePicture !== user.profilePicture
    ) {
      const { deleteImage } = await import("@/lib/cloudinary");
      await deleteImage(oldProfilePicture);
    }

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        success: false,
        message: "Failed to update profile. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
