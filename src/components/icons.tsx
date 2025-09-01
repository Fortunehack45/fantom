
import { type SVGProps } from "react";

export function GhostIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 4.7A2.2 2.2 0 0 0 17.8 4H6.2a2.2 2.2 0 0 0-2.2 2.2V14a2 2 0 0 0 2 2h2.2a2.5 2.5 0 0 1 2.3 1.25L12 21l1.3-1.75A2.5 2.5 0 0 1 15.6 18H18a2 2 0 0 0 2-2V6.7a2.2 2.2 0 0 0-2.2-2.2Z" />
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
    </svg>
  );
}

export function FantomIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg" {...props}>
            <text 
                x="50%" 
                y="50%" 
                dy=".35em" 
                textAnchor="middle" 
                fontFamily="Teko, sans-serif" 
                fontSize="48" 
                fill="white"
                className="font-bold"
                letterSpacing="0.1em"
            >
                FANTOM
            </text>
        </svg>
    )
}
