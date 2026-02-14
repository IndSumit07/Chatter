import mongoose from "mongoose";

const FriendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate requests
FriendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

// Index for efficient queries
FriendRequestSchema.index({ to: 1, status: 1 });
FriendRequestSchema.index({ from: 1, status: 1 });

export default mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", FriendRequestSchema);
