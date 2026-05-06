import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admin = await prisma.admin.findFirst({
      where: { role: "SUPER_ADMIN" },
      select: {
        phone: true,
        email: true,
        address: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: admin || {
        phone: "+91 98765 43210",
        email: "care@adamsclinic.com",
        address: "123 Medical Avenue, Health City, Sector 45, India."
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
