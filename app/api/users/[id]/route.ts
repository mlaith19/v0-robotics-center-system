import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { id } = params

    const updateData: any = {}

    if (body.phone !== undefined) {
      updateData.phone = body.phone?.trim() || null
    }

    if (body.status !== undefined) {
      updateData.status = body.status || "active"
    }

    if (body.permissions !== undefined) {
      updateData.permissions = body.permissions
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error("PATCH /api/users/[id] error:", err)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("DELETE /api/users/[id] error:", err)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
