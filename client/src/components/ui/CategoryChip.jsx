export default function CategoryChip({ category, selected, onClick, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full font-medium transition-all ${sizeClasses}`}
      style={{
        backgroundColor: selected ? category.color : '#FFFFFF',
        color: selected ? '#FFFFFF' : '#1C2833',
        border: `2px solid ${selected ? category.color : '#E5E8EB'}`,
        boxShadow: selected ? `0 2px 8px ${category.color}33` : 'none',
      }}
    >
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </button>
  );
}
