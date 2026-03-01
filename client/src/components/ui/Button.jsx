export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'font-semibold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = 'py-3 px-6';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-900',
    secondary: 'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white',
    ghost: 'bg-surface-alt text-text-secondary hover:bg-border',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={`${base} ${sizes} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
