import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function PUT(request, { params }) {
  try {
    const { token } = params;
    const { password } = await request.json();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await dbConnect();

    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ message: "Token is invalid or has expired." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successful." }, { status: 200 });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}