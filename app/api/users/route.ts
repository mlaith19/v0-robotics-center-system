import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    const status = searchParams.get("status") || ""

    const users = await prisma.user.findMany({
      where: {
        AND: [
          status ? { status } : {},
          q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                  { phone: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (err: any) {
    console.error("GET /api/users error:", err)
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 })
    }

    const created = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        status: body.status || "active",
        permissions: body.permissions || [],
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/users error:", err)
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}