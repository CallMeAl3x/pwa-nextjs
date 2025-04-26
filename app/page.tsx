import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="space-y-6 text-center">
        <h1 className={cn("text-6xl font-semibold text-white drop-shadow-md")}>Auth</h1>
        <p className="text-white text-lg">A simple authentication service</p>

        <div>
          <LoginButton mode="modal" asChild>
            <Button variant="secondary" size="lg" className="mr-2">
              Sign in
            </Button>
          </LoginButton>
          <Link href="/offline-profile" className=" flex items-center gap-2 text-white hover:text-gray-200">
            Go offline and check your profile
          </Link>
          <Link href="/cached-on-nav" className="flex items-center gap-2 text-white hover:text-gray-200">
            Cache on navigation
          </Link>
        </div>
      </div>
    </main>
  );
}
