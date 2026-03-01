export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-card border border-line shadow-sm hover:shadow-md transition-shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
