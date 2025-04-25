"use client";

import { RoleGate } from "@/components/auth/role-gate";
import { FormSuccess } from "@/components/form-success";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole } from "@prisma/client";

const AdminPage = () => {
  return (
    <Card className="w-[600px]">
      <CardHeader className="text-2xl text-center font-semibold">Admin</CardHeader>
      <CardContent className="space-y-4">
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess message="You are an admin." />
        </RoleGate>
      </CardContent>
    </Card>
  );
};

export default AdminPage;
