import { ShieldAlert } from "lucide-react";
import { getCurrentAppUser, canManageUsers } from "@/lib/auth";
import { listUsers } from "@/lib/customers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagementTable } from "@/components/admin/user-management-table";

export default async function UsersPage() {
  const currentUser = await getCurrentAppUser();
  const users = await listUsers();

  if (!currentUser || !canManageUsers(currentUser.role)) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="size-4" />
        <AlertTitle>접근 권한이 없습니다</AlertTitle>
        <AlertDescription>사용자 관리는 관리자 권한이 필요합니다.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">사용자 관리</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementTable initialUsers={users} />
        </CardContent>
      </Card>
    </div>
  );
}
