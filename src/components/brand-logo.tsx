import Image from "next/image";

export function BrandMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/assets/images/LJ.png"
      alt="LurJing"
      width={size}
      height={size}
      className={className}
    />
    // <svg
    //   className={className}
    //   width={size}
    //   height={size}
    //   viewBox="0 0 48 48"
    //   fill="none"
    //   role="img"
    //   aria-label="LurJing"
    // >
    //   <rect width="48" height="48" rx="15" fill="#EAF8E4" />
    //   <path
    //     d="M11.5 10.5C11.5 8.57 13.07 7 15 7C16.93 7 18.5 8.57 18.5 10.5V30.5C18.5 32.43 20.07 34 22 34H26.5C28.43 34 30 35.57 30 37.5C30 39.43 28.43 41 26.5 41H21C15.75 41 11.5 36.75 11.5 31.5V10.5Z"
    //     fill="#116149"
    //   />
    //   <path
    //     d="M31 13.5C31 11.57 32.57 10 34.5 10C36.43 10 38 11.57 38 13.5V29C38 36.73 31.73 43 24 43H22.5C20.57 43 19 41.43 19 39.5C19 37.57 20.57 36 22.5 36H24C27.87 36 31 32.87 31 29V13.5Z"
    //     fill="#16A36A"
    //   />
    //   <path
    //     d="M34.5 7.5C36.9 4.7 40.3 4.2 43 5.4C42.5 8.8 40.2 11.5 36.4 12.1C37.2 9.9 39 8.1 41.3 6.9C38.8 7 36.8 7.2 34.5 7.5Z"
    //     fill="#7DDC57"
    //   />
    //   <circle cx="38.5" cy="17.5" r="2.5" fill="#FFD66B" />
    //   <path
    //     d="M8 28C5.1 26.5 3.5 23.5 4 20.1C7.6 19.9 10.4 21.6 11.7 25C9.4 24.3 7.5 23.1 5.8 21.5C6.5 24 7.1 26 8 28Z"
    //     fill="#9CE35B"
    //   />
    // </svg>
  );
}
