import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request) {
  const { email } = await request.json();
  try {
    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "Email doesn't exist.", ok: false }, { status: 404 });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const passwordResetExpires = Date.now() + 600000; 

    user.forgotPasswordToken = passwordResetToken;
    user.forgotPasswordTokenExpiry = passwordResetExpires;
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/forgot-password/${resetToken}`;
    const message = `We received a password reset request. Please use the below link to reset your password. This link is valid for 10 minutes.\n\n${resetUrl}`;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `technicalteamgndec <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: "Password Reset Request",
        text: message,
    });

    return NextResponse.json({ message: "Password reset link sent to your email.",ok: true }, { status: 200 });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    const user = await User.findOne({ email });
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}