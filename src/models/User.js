import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [false], // False if using social login exclusively, but good to have
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Check if the model already exists before compiling it
export default mongoose.models.User || mongoose.model("User", UserSchema);
