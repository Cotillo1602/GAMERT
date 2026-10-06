import type { ReactNode, SVGProps } from "react";
import { cn } from "../../lib/utils";

/* Set de iconos (estilo outline 24×24) usado en lugar de los
   "SYMBOL" de iconos del Figma (gridicons:*, lsicon:*, mdi:*, ...). */

const P: Record<string, ReactNode> = {
  home: (
    <>
      <path d="M3 9.5 12 2l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z" />
      <path d="M9.5 21.5V13h5v8.5" />
    </>
  ),
  trophy: (
    <>
      <path d="M6 4H4.5a2.5 2.5 0 0 0 0 5H6" />
      <path d="M18 4h1.5a2.5 2.5 0 0 1 0 5H18" />
      <path d="M5 22h14" />
      <path d="M10 14.7V17c0 .6-.5 1-1 1.2C7.9 18.7 7 20.2 7 22" />
      <path d="M14 14.7V17c0 .6.5 1 1 1.2 1.1.5 2 2 2 3.8" />
      <path d="M7 2h10v6a5 5 0 0 1-10 0z" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  chart: <path d="M18 20V10M12 20V4M6 20v-6" />,
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  menu: <path d="M3 12h18M3 6h18M3 18h18" />,
  bell: (
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7.5" />
      <path d="m21 21-4.2-4.2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.8-7.5 10-7.5S22 12 22 12s-3.8 7.5-10 7.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M17.9 17.9A10.4 10.4 0 0 1 12 19.5C5.8 19.5 2 12 2 12a18.6 18.6 0 0 1 5-5.7M9.9 4.7A10.6 10.6 0 0 1 12 4.5c6.2 0 10 7.5 10 7.5a18.7 18.7 0 0 1-2.1 3.1" />
      <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
      <path d="m2 2 20 20" />
    </>
  ),
  chevronRight: <path d="m9 5 7 7-7 7" />,
  chevronDown: <path d="m5 9 7 7 7-7" />,
  arrowRight: <path d="M4 12h15m-6-7 7 7-7 7" />,
  arrowLeft: <path d="M20 12H5m6 7-7-7 7-7" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m20 6-11 11-5-5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="m8 12 2.8 2.8L16.5 9" />
    </>
  ),
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5V13M12 16.5h.01" />
    </>
  ),
  alertTriangle: (
    <>
      <path d="M10.3 3.9 2 18.5A2 2 0 0 0 3.7 21.5h16.6A2 2 0 0 0 22 18.5L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  settings: (
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1.5 14h5M9.5 8h5M17.5 16h5" />
  ),
  wallet: (
    <>
      <rect x="2" y="5.5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20M16.5 14.5h.01" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.2 9.2a3 3 0 0 1 5.8 1c0 2-3 2.8-3 2.8" />
      <path d="M12 17h.01" />
    </>
  ),
  shield: <path d="M12 21.5s8-3.8 8-9.5V5.2L12 2.5 4 5.2V12c0 5.7 8 9.5 8 9.5z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19" />
      <path d="M12 2.5a15 15 0 0 1 3.8 9.5 15 15 0 0 1-3.8 9.5 15 15 0 0 1-3.8-9.5A15 15 0 0 1 12 2.5z" />
    </>
  ),
  volume: (
    <>
      <path d="M11 5 6.5 9H3v6h3.5L11 19z" />
      <path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.5 6.2a8 8 0 0 1 0 11.6" />
    </>
  ),
  logOut: (
    <>
      <path d="M9.5 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3h4" />
      <path d="m16.5 16.5 4.5-4.5-4.5-4.5M21 12H9" />
    </>
  ),
  trash: (
    <>
      <path d="M3.5 6h17M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6" />
      <path d="M18.5 6 17.7 19a2 2 0 0 1-2 1.9H8.3a2 2 0 0 1-2-1.9L5.5 6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
      <path d="M16 2.5v4M8 2.5v4M3 10h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5V12l3.5 2" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5v11M15 9.2a3.2 3.2 0 0 0-3-1.7c-1.7 0-3 .9-3 2.1s1 1.8 3 2.2 3 .9 3 2.2-1.3 2.1-3 2.1a3.2 3.2 0 0 1-3-1.7" />
    </>
  ),
  trophySmall: (
    <path d="M7 3h10v5a5 5 0 0 1-10 0zM7 4.5H4.5v2A2.5 2.5 0 0 0 7 9M17 4.5h2.5v2a2.5 2.5 0 0 1-2.5 2.5M12 13v4M8.5 21h7l-1-4h-5z" />
  ),
  gamepad: (
    <>
      <path d="M7.5 7h9a5.5 5.5 0 0 1 5.4 6.4l-.7 3.4a2.5 2.5 0 0 1-4.4 1.2l-1.3-1.6H8.5l-1.3 1.6a2.5 2.5 0 0 1-4.4-1.2l-.7-3.4A5.5 5.5 0 0 1 7.5 7z" />
      <path d="M7 11v3M5.5 12.5h3M16 12h.01M18 13.5h.01" />
    </>
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 1.5v4M12 18.5v4M22.5 12h-4M5.5 12h-4" />
    </>
  ),
  cloud: <path d="M18 18.5H7A4.5 4.5 0 0 1 6.3 9.6a6 6 0 0 1 11.5-1.4A4.4 4.4 0 0 1 18 18.5z" />,
  layers: <path d="m12 2.5 9.5 5-9.5 5-9.5-5zM2.5 16.5l9.5 5 9.5-5M2.5 12l9.5 5 9.5-5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <path d="M3.5 5.5h17l-6.5 7.5V20l-4-2.2v-4.8z" />,
  more: <path d="M12 6.5h.01M12 12h.01M12 17.5h.01" />,
  facebook: (
    <path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V2.5h-2.5A4.5 4.5 0 0 0 10 7v1.5H7.5V12H10v9.5h4V12h2.7l.5-3.5z" />
  ),
  google: (
    <>
      <path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.1a4.4 4.4 0 0 1-1.9 2.8v2.3h3.1A9 9 0 0 0 21 12.2z" />
      <path d="M12 21.5a9 9 0 0 0 6.3-2.5l-3.1-2.3a5.6 5.6 0 0 1-8.3-2.9H3.5V17a9 9 0 0 0 8.5 4.5z" />
      <path d="M6.9 13.8a5.4 5.4 0 0 1 0-3.5V7.5H3.5a9 9 0 0 0 0 8z" />
      <path d="M12 6.3a4.9 4.9 0 0 1 3.4 1.3l2.6-2.6A9 9 0 0 0 3.5 7.5l3.4 2.8A5.6 5.6 0 0 1 12 6.3z" />
    </>
  ),
  apple: (
    <path d="M16.3 12.7c0-2.6 2.1-3.9 2.2-4a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1 1-3.9 1s-2-1-3.4-1A5 5 0 0 0 3.2 9.6c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 3 2.3 1.2 0 1.6-.7 3.1-.7s1.9.7 3.1.7 2.2-1.1 3-2.3a9.7 9.7 0 0 0 1.3-2.7 4.6 4.6 0 0 1-2.6-3.5zM13.7 4.6A4.3 4.3 0 0 0 14.7 1.9a4.6 4.6 0 0 0-3 1.5 4 4 0 0 0-1 2.6 3.6 3.6 0 0 0 2-1.4z" />
  ),
  link: (
    <path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7" />
  ),
  share: (
    <>
      <circle cx="18" cy="5.5" r="2.8" />
      <circle cx="6" cy="12" r="2.8" />
      <circle cx="18" cy="18.5" r="2.8" />
      <path d="m8.5 10.7 7-3.4M8.5 13.3l7 3.4" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15" r="6" />
      <path d="M12 12.6l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" />
      <path d="M8.5 9.5 6 2.5h12l-2.5 7" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4.5H5.5A2.5 2.5 0 0 0 3 7v12.5A2.5 2.5 0 0 0 5.5 22H18a2.5 2.5 0 0 0 2.5-2.5V14" />
      <path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
    </>
  ),
  trophy2: (
    <>
      <path d="M7 3h10v5.5a5 5 0 0 1-10 0z" />
      <path d="M7 4.5H4.5v2A2.5 2.5 0 0 0 7 9M17 4.5h2.5v2a2.5 2.5 0 0 1-2.5 2.5" />
      <path d="M10 13.5V17h4v-3.5M8.5 21h7l-1-4h-5z" />
    </>
  ),
  fire: (
    <path d="M12 22c4 0 6.5-2.6 6.5-6 0-4.4-4.5-6.6-4-11.5-2.6 1.3-4.5 4-4.5 6.5 0 1.4-1 2-1.8 1.3-.6-.5-.9-1.3-.9-2C5.7 11.5 5.5 13 5.5 16c0 3.4 2.5 6 6.5 6z" />
  ),
};

export type IconName = keyof typeof P;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, strokeWidth = 1.7, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(className)}
      {...rest}
    >
      {P[name]}
    </svg>
  );
}

/** Icono relleno (solid) para el logo / spots */
export function SolidIcon({
  children,
  size = 22,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn(className)}
      {...rest}
    >
      {children}
    </svg>
  );
}
