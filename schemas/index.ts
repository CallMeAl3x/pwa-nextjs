import { TwoFactorMethod, UserRole } from "@prisma/client";
import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  password: z.string().min(1, {
    message: "Password is required"
  }),
  code: z.optional(z.string())
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address"
  })
});

export const NewPasswordchema = z.object({
  password: z.string().min(6, {
    message: "Minimum 6 characters required"
  })
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required"
  }),
  name: z.string().min(1, {
    message: "Name is required"
  })
});

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
    TwoFactorMethod: z.optional(z.enum([TwoFactorMethod.EMAIL, TwoFactorMethod.OTP])),
    code: z.optional(z.string())
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "New Password is required",
      path: ["newPassword"]
    }
  );
