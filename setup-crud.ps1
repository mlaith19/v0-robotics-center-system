# setup-crud.ps1
# Writes CRUD API routes + minimal pages for Teachers & Courses (safe overwrite).
# Fix: directories that already exist won't throw errors.

$ErrorActionPreference = "Stop"

function Ensure-Dir($path) {
  if ([string]::IsNullOrWhiteSpace($path)) { return }
  if (!(Test-Path $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

function Write-File($path, $content) {
  $dir = Split-Path $path
  Ensure-Dir $dir
  Set-Content -Path $path -Value $content -Encoding UTF8 -Force
  Write-Host "Wrote: $path"
}

# -----------------------------
# TEACHERS API
# -----------------------------

Write-File "app/api/teachers/route.ts" @'
import { prisma } from "@/lib/prisma"

export async function GET() {
  const teachers = await prisma.teacher.findMany({
    orderBy: { createdAt: "desc" },
  })
  return Response.json(teachers)
}

export async function POST(req: Request) {
  const body = await req.json()

  const teacher = await prisma.teacher.create({
    data: {
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
    },
  })

  return Response.json(teacher, { status: 201 })
}
'@

Write-File "app/api/teachers/[id]/route.ts" @'
import { prisma } from "@/lib/prisma"

async function unwrapParams(params: any) {
  // Next.js 16: params can be a Promise in route handlers
  const p = await Promise.resolve(params)
  return p as { id: string }
}

export async function GET(_: Request, ctx: { params: any }) {
  const { id } = await unwrapParams(ctx.params)

  const teacher = await prisma.teacher.findUnique({
    where: { id },
  })

  return Response.json(teacher)
}

export async function PUT(req: Request, ctx: { params: any }) {
  const { id } = await unwrapParams(ctx.params)
  const body = await req.json()

  const teacher = await prisma.teacher.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
    },
  })

  return Response.json(teacher)
}

export async function DELETE(_: Request, ctx: { params: any }) {
  const { id } = await unwrapParams(ctx.params)

  await prisma.teacher.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
'@

# -----------------------------
# COURSES API
# -----------------------------

Write-File "app/api/courses/route.ts" @'
import { prisma } from "@/lib/prisma"

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  })
  return Response.json(courses)
}

export async function POST(req: Request) {
  const body = await req.json()

  const course = await prisma.course.create({
    data: {
      name: body.name,
    },
  })

  return Response.json(course, { status: 201 })
}
'@

Write-File "app/api/courses/[id]/route.ts" @'
import { prisma } from "@/lib/prisma"

async function unwrapParams(params: any) {
  const p = await Promise.resolve(params)
  return p as { id: string }
}

export async function GET(_: Request, ctx: { params: any }) {
  const { id } = await unwrapParams(ctx.params)

  const course = await prisma.course.findUnique({
    where: { id },
  })

  return Response.json(course)
}

export async function PUT(req: Request, ctx: { params: any }) {
  const { id } = await unwrapParams(ctx.params)
  const body = await req.json()

  const course = await prisma.course.update({
    where: { id },
    data: {
      name: body.name,
    },
  })

  return Response.json(course)
}

export async function DELETE(_: Request, ctx: { params: any }) {
  const { id } = await unwrapParams(ctx.params)

  await prisma.course.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
'@

Write-Host ""
Write-Host "? Done. Files generated/overwritten successfully."
Write-Host "Next steps:"
Write-Host "  1) npm run dev"
Write-Host "  2) Test endpoints:"
Write-Host "     GET  /api/teachers"
Write-Host "     POST /api/teachers"
Write-Host "     GET  /api/courses"
Write-Host "     POST /api/courses"
Write-Host ""
