"use client";

import { FormEvent, useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppUserRow } from "@/lib/types";

type CreateUserForm = {
  loginId: string;
  email: string;
  name: string;
  password: string;
  role: AppUserRow["role"];
  status: AppUserRow["status"];
};

type EditUserForm = {
  id: string;
  loginId: string;
  email: string;
  name: string;
  profileImageUrl: string;
  role: AppUserRow["role"];
  status: AppUserRow["status"];
};

const initialCreateForm: CreateUserForm = {
  loginId: "",
  email: "",
  name: "",
  password: "",
  role: "agent",
  status: "active",
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  const seoul = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const year = seoul.getUTCFullYear();
  const month = String(seoul.getUTCMonth() + 1).padStart(2, "0");
  const day = String(seoul.getUTCDate()).padStart(2, "0");
  const hours = String(seoul.getUTCHours()).padStart(2, "0");
  const minutes = String(seoul.getUTCMinutes()).padStart(2, "0");
  const seconds = String(seoul.getUTCSeconds()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

export function UserManagementTable({ initialUsers }: { initialUsers: AppUserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [createForm, setCreateForm] = useState<CreateUserForm>(initialCreateForm);
  const [editForm, setEditForm] = useState<EditUserForm | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateUser(
    id: string,
    patch: Partial<
      Pick<AppUserRow, "loginId" | "email" | "name" | "profileImageUrl" | "role" | "status">
    >,
  ) {
    const previous = users;
    setUsers((current) =>
      current.map((user) => (user.id === id ? { ...user, ...patch } : user)),
    );

    startTransition(async () => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        setUsers(previous);
        return;
      }

      const data = await response.json();
      if (data.user) {
        setUsers((current) =>
          current.map((user) => (user.id === id ? { ...user, ...data.user } : user)),
        );
      }
    });
  }

  function openEditDialog(user: AppUserRow) {
    setEditForm({
      id: user.id,
      loginId: user.loginId,
      email: user.email,
      name: user.name,
      profileImageUrl: user.profileImageUrl ?? "",
      role: user.role,
      status: user.status,
    });
    setEditError(null);
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const data = await response.json();

    setIsCreating(false);

    if (!response.ok) {
      setCreateError(data.error ?? "계정을 추가하지 못했습니다.");
      return;
    }

    setUsers((current) => [data.user, ...current]);
    setCreateForm(initialCreateForm);
    setIsCreateOpen(false);
  }

  async function saveEditedUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editForm) {
      return;
    }

    setEditError(null);
    setIsSavingEdit(true);

    const response = await fetch(`/api/users/${editForm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loginId: editForm.loginId,
        email: editForm.email,
        name: editForm.name,
        profileImageUrl: editForm.profileImageUrl,
        role: editForm.role,
        status: editForm.status,
      }),
    });
    const data = await response.json();

    setIsSavingEdit(false);

    if (!response.ok) {
      setEditError(data.error ?? "계정을 수정하지 못했습니다.");
      return;
    }

    setUsers((current) =>
      current.map((user) => (user.id === editForm.id ? { ...user, ...data.user } : user)),
    );
    setEditForm(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm">
              <Plus className="size-4" />
              계정 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createUser} className="space-y-4">
              <DialogHeader>
                <DialogTitle>계정 추가</DialogTitle>
                <DialogDescription>
                  새 사용자가 CRM에 로그인할 계정을 만듭니다.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="new-login-id">로그인 ID</Label>
                  <Input
                    id="new-login-id"
                    value={createForm.loginId}
                    onChange={(event) =>
                      setCreateForm((form) => ({ ...form, loginId: event.target.value }))
                    }
                    autoComplete="username"
                    required
                    minLength={3}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="new-name">이름</Label>
                  <Input
                    id="new-name"
                    value={createForm.name}
                    onChange={(event) =>
                      setCreateForm((form) => ({ ...form, name: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="new-email">이메일</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={createForm.email}
                    onChange={(event) =>
                      setCreateForm((form) => ({ ...form, email: event.target.value }))
                    }
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="new-password">초기 비밀번호</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm((form) => ({ ...form, password: event.target.value }))
                    }
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>역할</Label>
                    <Select
                      value={createForm.role}
                      onValueChange={(role: AppUserRow["role"]) =>
                        setCreateForm((form) => ({ ...form, role }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">관리자</SelectItem>
                        <SelectItem value="manager">매니저</SelectItem>
                        <SelectItem value="agent">상담원</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>상태</Label>
                    <Select
                      value={createForm.status}
                      onValueChange={(status: AppUserRow["status"]) =>
                        setCreateForm((form) => ({ ...form, status }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="invited">invited</SelectItem>
                        <SelectItem value="disabled">disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {createError ? (
                  <p className="text-sm text-destructive">{createError}</p>
                ) : null}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  취소
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "추가 중" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">프로필</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>로그인 ID</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead className="w-36">역할</TableHead>
            <TableHead className="w-36">상태</TableHead>
            <TableHead>최근 로그인</TableHead>
            <TableHead className="w-20 text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={isPending ? "opacity-80" : undefined}>
              <TableCell>
                <UserAvatar user={user} />
              </TableCell>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {user.loginId}
                </Badge>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(role: AppUserRow["role"]) => updateUser(user.id, { role })}
                >
                  <SelectTrigger size="sm" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="manager">매니저</SelectItem>
                    <SelectItem value="agent">상담원</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={user.status}
                  onValueChange={(status: AppUserRow["status"]) =>
                    updateUser(user.id, { status })
                  }
                >
                  <SelectTrigger size="sm" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="invited">invited</SelectItem>
                    <SelectItem value="disabled">disabled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {formatDateTime(user.lastLoginAt)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(user)}
                >
                  <Pencil className="size-3.5" />
                  수정
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={Boolean(editForm)} onOpenChange={(open) => !open && setEditForm(null)}>
        <DialogContent className="sm:max-w-md">
          {editForm ? (
            <form onSubmit={saveEditedUser} className="space-y-4">
              <DialogHeader>
                <DialogTitle>계정 수정</DialogTitle>
                <DialogDescription>
                  사용자 기본 정보와 프로필 사진을 변경합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-3 rounded-lg border border-[#dbe4ef] bg-[#f8fbff] p-3">
                <UserAvatar
                  user={{
                    name: editForm.name,
                    profileImageUrl: editForm.profileImageUrl || null,
                  }}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0d1b3d]">
                    {editForm.name || "이름 없음"}
                  </p>
                  <p className="truncate text-xs text-[#69758a]">
                    {editForm.email || "이메일 없음"}
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-login-id">로그인 ID</Label>
                  <Input
                    id="edit-login-id"
                    value={editForm.loginId}
                    onChange={(event) =>
                      setEditForm((form) =>
                        form ? { ...form, loginId: event.target.value } : form,
                      )
                    }
                    autoComplete="username"
                    required
                    minLength={3}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-name">이름</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((form) => (form ? { ...form, name: event.target.value } : form))
                    }
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-email">이메일</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(event) =>
                      setEditForm((form) => (form ? { ...form, email: event.target.value } : form))
                    }
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-profile-image-url">프로필 사진 URL</Label>
                  <Input
                    id="edit-profile-image-url"
                    type="url"
                    value={editForm.profileImageUrl}
                    onChange={(event) =>
                      setEditForm((form) =>
                        form ? { ...form, profileImageUrl: event.target.value } : form,
                      )
                    }
                    placeholder="https://example.com/profile.jpg"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>역할</Label>
                    <Select
                      value={editForm.role}
                      onValueChange={(role: AppUserRow["role"]) =>
                        setEditForm((form) => (form ? { ...form, role } : form))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">관리자</SelectItem>
                        <SelectItem value="manager">매니저</SelectItem>
                        <SelectItem value="agent">상담원</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>상태</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(status: AppUserRow["status"]) =>
                        setEditForm((form) => (form ? { ...form, status } : form))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="invited">invited</SelectItem>
                        <SelectItem value="disabled">disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editError ? <p className="text-sm text-destructive">{editError}</p> : null}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditForm(null)}>
                  취소
                </Button>
                <Button type="submit" disabled={isSavingEdit}>
                  {isSavingEdit ? "저장 중" : "저장"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserAvatar({
  user,
  size = "md",
}: {
  user: Pick<AppUserRow, "name" | "profileImageUrl">;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "size-14 text-base" : "size-9 text-sm";

  if (user.profileImageUrl) {
    return (
      <span
        className={`${sizeClass} block shrink-0 rounded-full bg-cover bg-center ring-1 ring-[#d5e0ee]`}
        style={{ backgroundImage: `url("${user.profileImageUrl}")` }}
        aria-label={`${user.name} 프로필 사진`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} grid shrink-0 place-items-center rounded-full bg-[#e9f0ff] font-semibold text-[#1f6fff] ring-1 ring-[#d5e0ee]`}
      aria-label={`${user.name} 프로필 기본 이미지`}
    >
      {user.name.slice(0, 1)}
    </span>
  );
}
