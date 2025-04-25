"use client";
import { settings } from "@/actions/settings";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { FormWarning } from "@/components/form-warning";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SettingsSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { TwoFactorMethod, UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import QRCode from "react-qr-code"; // Import react-qr-code
import * as z from "zod";

const SettingPage = () => {
  const user = useCurrentUser();
  const { update } = useSession();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [warning, setWarning] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null); // State to store the QR code

  const form = useForm({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      name: user?.name || undefined,
      email: user?.email || undefined,
      role: user?.role || UserRole.USER, // Provide a default value for role
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
      TwoFactorMethod: user?.TwoFactorMethod || undefined,
      code: undefined
    },
    mode: "onSubmit"
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    if (!values.email && user?.email) {
      values.email = user.email;
    }
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }

          if (data.success) {
            update();
            setSuccess(data.success);
            setWarning(undefined);
          }

          if (data.warning) {
            setWarning(data.warning);
          }

          if (data.qrCode) {
            setQrCode(data.qrCode);
          }

          if (data.pendingUpdate) {
            setShowTwoFactor(true);
          } else {
            setQrCode(null);
            setShowTwoFactor(false);
          }
        })
        .catch(() => {
          setError("An error occurred");
        });
    });
  };

  return (
    <Card className="w-[600px]">
      <CardHeader className="text-2xl text-center font-semibold">
        <p>Settings </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user?.isOAuth === false && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="john.doe@example.com" type="email" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="******" type="password" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="******" type="password" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          {...field}
                          disabled={isPending}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectContent>
                              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                              <SelectItem value={UserRole.USER}>User</SelectItem>
                            </SelectContent>
                          </SelectContent>
                        </Select>
                        <FormError />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isTwoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Two Factor Authentication</FormLabel>
                          <FormDescription>Enable two factor authentication for your account</FormDescription>
                        </div>
                        <FormControl>
                          <Switch disabled={isPending} checked={!!field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("isTwoFactorEnabled") && (
                    <FormField
                      control={form.control}
                      name="TwoFactorMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Two Factor Method</FormLabel>
                          <Select
                            {...field}
                            disabled={isPending || user.isTwoFactorEnabled}
                            onValueChange={field.onChange}
                            defaultValue={field.value || TwoFactorMethod.EMAIL}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={TwoFactorMethod.EMAIL}>Email</SelectItem>
                              <SelectItem value={TwoFactorMethod.OTP}>Authenticator App</SelectItem>
                            </SelectContent>
                          </Select>
                          {!user.isTwoFactorEnabled ? (
                            <FormDescription>Choose your preferred two-factor authentication method</FormDescription>
                          ) : (
                            <FormDescription>You cannot change 2FA method once enabled</FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              {qrCode && (
                <div className="mt-4">
                  <p>Scan this QR code with Google Authenticator:</p>
                  <QRCode value={qrCode || ""} className="mt-3" />
                </div>
              )}

              {showTwoFactor && TwoFactorMethod.EMAIL && (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Two Factor Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123456" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormError message={error} />
              <FormSuccess message={success} />
              <FormWarning message={warning} />
              <Button type="submit" disabled={isPending}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingPage;
