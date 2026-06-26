import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  await connectDB();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json({ message: "Invalid password" }, { status: 400 });
  }

  return NextResponse.json({ message: "Login success", user });
}
