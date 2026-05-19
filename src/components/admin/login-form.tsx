"use client";

import Image from "next/image";
import { useActionState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5 py-10 text-[#0d1b3d]">
      <section className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-lg border border-[#d8e0ea] bg-white shadow-[0_14px_32px_rgba(15,28,48,0.12)]">
            <Image src="/logo.jpg" alt="LEEDO 로고" width={48} height={48} priority />
          </div>
          <h1 className="text-2xl font-bold tracking-normal">LEEDO</h1>
          <p className="mt-2 text-sm text-[#69758a]">ID와 비밀번호를 입력해주세요.</p>
        </div>

        <form
          action={formAction}
          className="rounded-lg border border-[#d8e0ea] bg-white p-6 shadow-[0_20px_56px_rgba(15,28,48,0.12)]"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginId" className="text-[#0d1b3d]">ID</Label>
              <Input
                id="loginId"
                name="loginId"
                autoComplete="username"
                placeholder="아이디"
                className="h-10 border-[#d8e0ea] bg-[#f8fafc] focus-visible:border-[#2f70dc] focus-visible:ring-[#2f70dc]/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0d1b3d]">PW</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호"
                className="h-10 border-[#d8e0ea] bg-[#f8fafc] focus-visible:border-[#2f70dc] focus-visible:ring-[#2f70dc]/20"
                required
              />
            </div>
            <div aria-live="polite">
              {state.error ? (
                <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="h-10 w-full bg-[#2f70dc] text-white hover:bg-[#245fc4]"
              disabled={isPending}
            >
              {isPending ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogIn className="size-4" aria-hidden="true" />
              )}
              {isPending ? "확인 중" : "로그인"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
