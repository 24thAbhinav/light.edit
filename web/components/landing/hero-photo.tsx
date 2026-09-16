import type { SVGProps } from "react";

export function HeroPhoto({
  seed,
  ...props
}: SVGProps<SVGSVGElement> & { seed: string }) {
  const id = (name: string) => `hp-${seed}-${name}`;

  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      {...props}
    >
      <defs>
        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#110c1e" />
          <stop offset="0.24" stopColor="#2c1b45" />
          <stop offset="0.44" stopColor="#57305c" />
          <stop offset="0.57" stopColor="#8a4467" />
          <stop offset="0.65" stopColor="#bb6b84" />
          <stop offset="0.69" stopColor="#dd9c9e" />
          <stop offset="0.72" stopColor="#e9aca4" />
          <stop offset="1" stopColor="#e9aca4" />
        </linearGradient>

        <radialGradient id={id("sun")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1ee" stopOpacity="0.75" />
          <stop offset="0.34" stopColor="#ffd2d6" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ff9db4" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={id("haze")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8c9bf" stopOpacity="0" />
          <stop offset="1" stopColor="#f8c9bf" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id={id("far")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a97a93" />
          <stop offset="0.28" stopColor="#6d4c66" />
          <stop offset="1" stopColor="#3a2a3f" />
        </linearGradient>
        <linearGradient id={id("mid")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#66426a" />
          <stop offset="0.3" stopColor="#402a47" />
          <stop offset="1" stopColor="#241a2b" />
        </linearGradient>
        <linearGradient id={id("near")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3e2a44" />
          <stop offset="0.32" stopColor="#261b2d" />
          <stop offset="1" stopColor="#150f1b" />
        </linearGradient>

        <radialGradient id={id("vig")} cx="0.5" cy="0.44" r="0.78">
          <stop offset="0.5" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.58" />
        </radialGradient>

        <filter id={id("cloud")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id={id("disc")} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      <rect width="1200" height="800" fill={`url(#${id("sky")})`} />

      <g filter={`url(#${id("cloud")})`}>
        <ellipse cx="215" cy="176" rx="280" ry="9" fill="#b57d96" opacity="0.24" />
        <ellipse cx="890" cy="132" rx="310" ry="8" fill="#8f6389" opacity="0.22" />
        <ellipse cx="600" cy="252" rx="390" ry="10" fill="#d9999f" opacity="0.16" />
        <ellipse cx="990" cy="330" rx="220" ry="8" fill="#eeb4b0" opacity="0.18" />
      </g>

      <ellipse cx="790" cy="478" rx="260" ry="150" fill={`url(#${id("sun")})`} />
      <circle
        cx="790"
        cy="466"
        r="36"
        fill="#fff2ee"
        opacity="0.86"
        filter={`url(#${id("disc")})`}
      />

      <rect x="0" y="458" width="1200" height="102" fill={`url(#${id("haze")})`} />

      <path
        d="M0 1000 V500 L110 484 L200 506 L300 452 L410 494 L510 466 L620 508 L730 448 L860 496 L970 470 L1080 500 L1200 478 V1000 Z"
        fill={`url(#${id("far")})`}
      />
      <path
        d="M0 1000 V534 L120 518 L210 536 L320 494 L430 530 L540 508 L650 536 L770 506 L880 534 L1000 514 L1120 538 L1200 522 V1000 Z"
        fill={`url(#${id("mid")})`}
      />
      <path
        d="M0 1000 V546 L140 530 L260 548 L380 524 L500 548 L620 530 L760 550 L900 532 L1040 550 L1200 538 V1000 Z"
        fill={`url(#${id("near")})`}
      />

      <path
        d="M0 1000 V660 C 170 626, 330 672, 520 654 C 700 640, 860 678, 1060 658 C 1130 650, 1170 656, 1200 660 V1000 Z"
        fill="#0f0a15"
      />
      <path
        d="M0 660 C 170 626, 330 672, 520 654 C 700 640, 860 678, 1060 658 C 1130 650, 1170 656, 1200 660"
        fill="none"
        stroke="#e79cb6"
        strokeWidth="2"
        opacity="0.14"
      />

      <rect width="1200" height="800" fill={`url(#${id("vig")})`} />
    </svg>
  );
}
