"use server";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/tokens";
import { SettingsSchema } from "@/schemas";
import { TwoFactorMethod } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import * as z from "zod";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();
  if (!user) {
    return { error: "You need to be logged in." };
  }

  const dbUser = await getUserById(user.id as string);
  if (!dbUser) {
    return { error: "User not found." };
  }

  let shouldShowTwoFactor = false;

  if (user.isOAuth) {
    values.email = undefined;
    values.newPassword = undefined;
    values.password = undefined;
    values.isTwoFactorEnabled = undefined;
    values.TwoFactorMethod = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email already in use." };
    }

    const verificationToken = await generateVerificationToken(values.email);

    await sendVerificationEmail(values.email, verificationToken.token);

    return {
      success: "Verification email sent. Please verify your email address."
    };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordMatch = await bcrypt.compare(values.password, dbUser.password);

    if (!passwordMatch) {
      return { error: "Invalid password." };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);

    values.password = hashedPassword;
    values.newPassword = undefined;

    await db.user.update({
      where: {
        id: dbUser.id
      },
      data: {
        password: hashedPassword,
        name: values.name,
        email: values.email,
        role: values.role,
        isTwoFactorEnabled: values.isTwoFactorEnabled,
        TwoFactorMethod: values.TwoFactorMethod
      }
    });
  }

  if (
    (values.isTwoFactorEnabled !== undefined && values.isTwoFactorEnabled !== dbUser.isTwoFactorEnabled) ||
    (values.TwoFactorMethod && values.TwoFactorMethod !== dbUser.TwoFactorMethod)
  ) {
    if (values.TwoFactorMethod === TwoFactorMethod.EMAIL) {
      if (!values.email) {
        return { error: "Email is required for two factor authentication." };
      }
      const twoFactorToken = await getTwoFactorTokenByEmail(values.email);

      if (!values.code) {
        const newToken = await generateTwoFactorToken(values.email);
        await sendTwoFactorTokenEmail(values.email, newToken.token);

        shouldShowTwoFactor = true;
        return { warning: "Please enter the verification code sent to your email to proceed.", pendingUpdate: true };
      } else {
      }
      if (!twoFactorToken || twoFactorToken.token !== values.code) {
        return { error: "Invalid code." };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code has expired." };
      }

      shouldShowTwoFactor = false;

      await db.user.update({
        where: {
          id: dbUser.id
        },
        data: {
          isTwoFactorEnabled: values.isTwoFactorEnabled,
          TwoFactorMethod: values.TwoFactorMethod
        }
      });
      return { success: `Two-factor authentication has been ${values.isTwoFactorEnabled ? "enabled" : "disabled"}.` };
    } else if (values.TwoFactorMethod === TwoFactorMethod.OTP) {
      if (!values.email) {
        return { error: "Email is required for two-factor authentication." };
      }

      if (!dbUser.otpSecret) {
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(values.email, "AuthBoilerPlate", secret);

        await db.user.update({
          where: { id: dbUser.id },
          data: { otpSecret: secret }
        });

        return {
          qrCode: otpauth,
          pendingUpdate: true,
          warning: "Scan the QR code with Google Authenticator to enable OTP-based two-factor authentication."
        };
      } else {
        if (!values.code) {
          return { warning: "Please enter the OTP code to proceed.", pendingUpdate: true };
        }

        const isValid = authenticator.verify({
          token: values.code,
          secret: dbUser.otpSecret
        });

        if (!isValid) {
          return { error: "Invalid OTP code." };
        }

        if (values.isTwoFactorEnabled) {
          await db.user.update({
            where: { id: dbUser.id },
            data: { isTwoFactorEnabled: true, TwoFactorMethod: TwoFactorMethod.OTP }
          });

          return { success: "Two-factor authentication has been enabled with OTP.", pendingUpdate: false };
        } else {
          await db.user.update({
            where: { id: dbUser.id },
            data: { otpSecret: null, isTwoFactorEnabled: false, TwoFactorMethod: null }
          });

          return { success: "Two-factor authentication has been disabled." };
        }
      }
    }
  }

  await db.user.update({
    where: {
      id: dbUser.id
    },
    data: {
      name: values.name,
      email: values.email,
      role: values.role,
      isTwoFactorEnabled: values.isTwoFactorEnabled,
      TwoFactorMethod: values.TwoFactorMethod
    }
  });

  return { success: "Settings Updated", shouldShowTwoFactor };
};
