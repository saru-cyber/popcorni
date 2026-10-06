export function PopcorniLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="22" cy="18" r="8" fill="currentColor" opacity="0.75" />
      <circle cx="34" cy="13" r="9" fill="currentColor" />
      <circle cx="46" cy="19" r="7" fill="currentColor" opacity="0.85" />
      <path d="M14 30h36l-4 26H18L14 30z" fill="currentColor" />
      <path
        d="M18 38h28M19.5 46h25"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
    </svg>
  );
}
