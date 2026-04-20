import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const email = "admin@inchallah.ci";
    const password = "Admin@1234";
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
      where: { email },
      update: { 
        password: hashedPassword,
        isActive: true,
        nom: "Administrateur",
        prenom: "Principal",
        role: Role.ADMIN
      },
      create: {
        email,
        password: hashedPassword,
        nom: "Administrateur",
        prenom: "Principal",
        role: Role.ADMIN,
        isActive: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin account verified/created",
      email: admin.email
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      env: !!process.env.DATABASE_URL
    }, { status: 500 });
  }
}
