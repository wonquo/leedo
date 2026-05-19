import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, hasDatabaseUrl } from "@/db";
import { appUsers } from "@/db/schema";
import { canManageUsers, getCurrentAppUser, serializeUser } from "@/lib/auth";
import { normalizeProfileImageUrl } from "@/lib/profile-image";

const userUpdateSchema = z
  .object({
    loginId: z.string().trim().min(3, "로그인 ID는 3자 이상이어야 합니다.").optional(),
    email: z.email("올바른 이메일을 입력해 주세요.").trim().toLowerCase().optional(),
    name: z.string().trim().min(1, "이름을 입력해 주세요.").optional(),
    profileImageUrl: z.string().trim().max(2048, "이미지 URL이 너무 깁니다.").optional(),
    role: z.enum(["admin", "manager", "agent"]).optional(),
    status: z.enum(["active", "invited", "disabled"]).optional(),
  })
  .strict();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentAppUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = userUpdateSchema.parse(await request.json());
    const patch = {
      ...body,
      ...(Object.hasOwn(body, "profileImageUrl")
        ? { profileImageUrl: normalizeProfileImageUrl(body.profileImageUrl) }
        : {}),
    };

    if (!hasDatabaseUrl()) {
      return NextResponse.json({ user: { id, ...patch } });
    }

    const [updated] = await getDb()
      .update(appUsers)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(appUsers.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ user: serializeUser(updated) });
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
