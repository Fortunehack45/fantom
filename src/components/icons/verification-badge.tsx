import { type SVGProps } from "react";
import { cn } from "@/lib/utils";

export function VerificationBadge({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 22"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <g fill="currentColor">
        <path d="M22,10.1c0,1.3-0.2,2.5-0.7,3.7c-0.5,1.2-1.2,2.2-2.2,3.1c-0.9,0.9-2,1.6-3.1,2.2c-1.2,0.5-2.4,0.7-3.7,0.7 c-1.3,0-2.5-0.2-3.7-0.7c-1.2-0.5-2.2-1.2-3.1-2.2c-0.9-0.9-1.6-2-2.2-3.1C1.2,12.6,1,11.4,1,10.1c0-1.3,0.2-2.5,0.7-3.7 c0.5-1.2,1.2-2.2,2.2-3.1c0.9-0.9,2-1.6,3.1-2.2c1.2-0.5,2.4-0.7,3.7-0.7c1.3,0,2.5,0.2,3.7,0.7c1.2,0.5,2.2,1.2,3.1,2.2 c0.9,0.9,1.6,2,2.2,3.1C21.8,7.6,22,8.8,22,10.1z"></path>
        <path fill="#fff" d="M9.8,14.8L16,8.5l-1.2-1.2l-5,5.1l-2.4-2.4L6.2,11L9.8,14.8z"></path>
      </g>
    </svg>
  );
}
