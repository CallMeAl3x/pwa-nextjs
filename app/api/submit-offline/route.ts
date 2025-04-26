import { submitOfflineData } from "@/actions/submit";
import { auth } from "@/auth"; // Ensure this path is correct
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Check authentication status via session cookie before processing
  const session = await auth();
  if (!session?.user?.id) {
    // Important: Return 401 Unauthorized if not logged in
    // Background Sync might retry, but it won't succeed without auth
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Call your existing server action, passing the data
    // The server action itself will handle getting the userId from the session again
    const result = await submitOfflineData(data);

    if (result.error) {
      // If the server action returns an error (e.g., validation failed)
      // Return a 400 Bad Request or appropriate status
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // If successful
    return NextResponse.json({ success: result.success || "Data received successfully." }, { status: 200 });
  } catch (error) {
    console.error("API Route Error (/api/submit-offline):", error);
    // Generic error if parsing fails or server action throws unexpectedly
    return NextResponse.json({ error: "Failed to process submission." }, { status: 500 });
  }
}
