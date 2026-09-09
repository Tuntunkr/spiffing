import { MARK_FRAME, MARK_S } from "@/lib/mark";

/**
 * The Spiffing mark: an open frame with a geometric S — sharp, tailored, small.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`block ${className}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" className="block size-full" focusable="false">
        <rect
          x={MARK_FRAME.x}
          y={MARK_FRAME.y}
          width={MARK_FRAME.width}
          height={MARK_FRAME.height}
          rx={MARK_FRAME.rx}
          fill="none"
          stroke="currentColor"
          strokeWidth={MARK_FRAME.strokeWidth}
        />
        <path d={MARK_S} fill="currentColor" />
      </svg>
    </span>
  );
}
