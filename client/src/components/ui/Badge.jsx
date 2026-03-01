export default function Badge({ children, color, className = '' }) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${className}`}
      style={{
        backgroundColor: color ? `${color}15` : undefined,
        color: color || undefined,
      }}
    >
      {children}
    </span>
  );
}
