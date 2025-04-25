import { db } from "@/lib/db";

export const getTwoFactorComfirmationByUserId = async (userId: string) => {
  try {
    const twoFactorComfirmation = db.twoFactorConfirmation.findUnique({
      where: {
        userId
      }
    });

    return twoFactorComfirmation;
  } catch {
    return null;
  }
};
