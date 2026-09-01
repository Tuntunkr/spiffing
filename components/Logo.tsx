/**
 * The Vitrine mark: a display case seen head on — an open frame with the
 * object it holds sitting inside it.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`block ${className}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" className="block size-full" focusable="false">
        <rect
          x="2.6"
          y="2.6"
          width="26.8"
          height="26.8"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
        />
        <path d="M10 10.5h4.1l2 8 2-8H22l-4.2 13h-3.6L10 10.5Z" fill="currentColor" />
      </svg>
    </span>
  );
}
