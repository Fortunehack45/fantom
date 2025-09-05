
import { type SVGProps } from "react";

export function GhostIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
      <title>Next.js</title>
      <path d="M12 0L2.363 5.432v13.136L12 24l9.637-5.432V5.432zM11.636 22.25v-8.84H2.727v-1.782l8.91-5.045v15.667zm.728 0V6.583l8.91 5.045v1.782h-8.91z" />
    </svg>
  );
}
