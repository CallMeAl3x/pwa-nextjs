/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <h1>This page is now available offline!</h1>
      <img src="images/cache-cache-everywhere.jpg" alt="!" />
      <Link href="/" prefetch={false}>
        back home
      </Link>
    </div>
  );
}
