import { TwoFactorMethod, UserRole } from "@prisma/client";
import { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  TwoFactorMethod: TwoFactorMethod;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
