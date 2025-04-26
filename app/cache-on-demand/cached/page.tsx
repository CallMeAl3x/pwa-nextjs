/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <h1>This page is available offline!</h1>
      <img src="/images/cache-me-outside.jpg" alt="!" />
      <Link href="/">back home</Link>
    </div>
  );
}
