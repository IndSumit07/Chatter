import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    // Parse request body
    const { email } = await req.json();

    // Validate input
    if (!email) {
      return Response.json(
        {
          success: false,
          message: "Please provide your email address",
        },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = user.generateResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      // Create reset URL
      const resetUrl = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/reset-password?token=${resetToken}`;

      // Email message
      const message = `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your Chatter account.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #ccfd52; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;

      // In production, you would send this via email service (nodemailer, resend, etc.)
      // For now, we'll just log it
      console.log("Password reset email would be sent to:", email);
      console.log("Reset URL:", resetUrl);

      // TODO: Implement actual email sending
      // Example with nodemailer (you already have it installed):
      /*
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Chatter" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: message,
      });
      */
    }

    // Always return success response to prevent email enumeration
    return Response.json(
      {
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to process request. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
