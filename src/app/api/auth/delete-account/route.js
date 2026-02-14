import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Message from "@/models/Message";
import FriendRequest from "@/models/FriendRequest";
import { verifyToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function DELETE(request) {
  try {
    await dbConnect();

    // 1. Auth Check - Token
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.userId;

    // 2. Body Check - Password
    let password;
    try {
      const body = await request.json();
      password = body.password;
    } catch (e) {
      // Password might be passed via query or headers in some weird cases, but body is standard
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required to delete account" },
        { status: 400 },
      );
    }

    // 3. User verification
    // Re-fetch user with password select
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        { status: 401 },
      );
    }

    // 4. Data Deletion

    // A. Delete all messages sent by OR received by the user
    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    // B. Remove user from 'readBy' arrays in any remaining messages
    await Message.updateMany({ readBy: userId }, { $pull: { readBy: userId } });

    // C. Remove user's reactions from any remaining messages
    await Message.updateMany(
      { "reactions.userId": userId },
      { $pull: { reactions: { userId: userId } } },
    );

    // D. Delete all friend requests (sent OR received)
    await FriendRequest.deleteMany({
      $or: [{ from: userId }, { to: userId }],
    });

    // E. Delete the User account itself
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: "Account and all associated data permanently deleted",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { success: false, message: "Server error during account deletion" },
      { status: 500 },
    );
  }
}
