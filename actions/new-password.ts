"use server";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { NewPasswordchema } from "@/schemas";
import bcrypt from "bcryptjs";
import * as z from "zod";
export const newPassword = async (values: z.infer<typeof NewPasswordchema>, token?: string | null) => {
  if (!token) {
    return {
      error: "Invalid token"
    };
  }

  const validateFields = NewPasswordchema.safeParse(values);

  if (!validateFields.success) {
    return {
      error: "Invalid password"
    };
  }

  const { password } = validateFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return {
      error: "Invalid token"
    };
  }

  const hasExpired = new Date() > existingToken.expires;

  if (hasExpired) {
    return {
      error: "Token has expired"
    };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return {
      error: "Email does not exist !"
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: {
      id: existingUser.id
    },
    data: {
      password: hashedPassword
    }
  });

  await db.passwordResetToken.delete({
    where: {
      id: existingToken.id
    }
  });

  return {
    success: "Password updated !"
  };
};
