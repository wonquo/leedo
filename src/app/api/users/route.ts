import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, hasDatabaseUrl } from "@/db";
import { appUsers } from "@/db/schema";
import {
  canManageUsers,
  getCurrentAppUser,
  hashPassword,
  serializeUser,
} from "@/lib/auth";

const userCreateSchema = z
  .object({
    loginId: z.string().trim().min(3, "로그인 ID는 3자 이상이어야 합니다."),
    email: z.email("올바른 이메일을 입력해 주세요.").trim().toLowerCase(),
    name: z.string().trim().min(1, "이름을 입력해 주세요."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    role: z.enum(["admin", "manager", "agent"]).default("agent"),
    status: z.enum(["active", "invited", "disabled"]).default("active"),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentAppUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = userCreateSchema.parse(await request.json());

    if (!hasDatabaseUrl()) {
      return NextResponse.json(
        {
          user: {
            id: crypto.randomUUID(),
            loginId: body.loginId,
            email: body.email,
            name: body.name,
            profileImageUrl: null,
            role: body.role,
            status: body.status,
            lastLoginAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        { status: 201 },
      );
    }

    const [created] = await getDb()
      .insert(appUsers)
      .values({
        loginId: body.loginId,
        passwordHash: hashPassword(body.password),
        email: body.email,
        name: body.name,
        role: body.role,
        status: body.status,
      })
      .returning();

    return NextResponse.json({ user: serializeUser(created) }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "입력값을 확인해 주세요.")
        : error instanceof Error
          ? error.message
          : "Invalid request";
    const isDuplicate =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      String(error.message).includes("duplicate key");

    return NextResponse.json(
      { error: isDuplicate ? "이미 사용 중인 로그인 ID 또는 이메일입니다." : message },
      { status: 400 },
    );
  }
}
