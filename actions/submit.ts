"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth"; // Import the auth helper
import { z } from "zod";

const SubmissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")) // Allow optional or empty string
  // userId is retrieved server-side, no need to include in client payload schema
});

interface SubmissionResult {
  success?: string;
  error?: string;
}

export const submitOfflineData = async (data: unknown): Promise<SubmissionResult> => {
  // 1. Get session server-side
  const session = await auth();
  if (!session?.user?.id) {
    console.error("Server Action Error: User not authenticated.");
    return { error: "User not authenticated." };
  }
  const userId = session.user.id;

  // 2. Validate the incoming data structure first
  const validatedFields = SubmissionSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error("Server Action Validation Error:", validatedFields.error.flatten().fieldErrors);
    return { error: "Invalid data received by server action." };
  }

  const { name, email } = validatedFields.data;

  console.log("Server Action: Received data - ", { name, email, userId });

  try {
    // 3. Include userId when creating the record
    await db.offlineSubmission.create({
      data: {
        name,
        email: email || null, // Store null if email is empty string
        userId: userId // Add the user ID
      }
    });
    console.log("Server Action: Data saved successfully.");
    return { success: "Data submitted successfully!" };
  } catch (error) {
    console.error("Server Action Error:", error);
    return { error: "Failed to save data to database." };
  }
};
