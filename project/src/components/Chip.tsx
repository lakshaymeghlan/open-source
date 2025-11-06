interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'tech' | 'topic';
  size?: 'sm' | 'md';
}

export default function Chip({ label, selected = false, onClick, variant = 'default', size = 'md' }: ChipProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 cursor-pointer select-none';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm'
  };

  const variantClasses = {
    default: selected
      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50 hover:bg-teal-500/30'
      : 'bg-[#1a2332] text-gray-400 border border-gray-700/50 hover:bg-[#1f2937] hover:text-gray-300',
    tech: selected
      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50 hover:bg-teal-500/30'
      : 'bg-[#1a2332] text-gray-400 border border-gray-700/50 hover:bg-[#1f2937] hover:text-gray-300',
    topic: 'bg-[#1a2332] text-gray-400 border border-gray-700/30 cursor-default hover:bg-[#1a2332]'
  };

  return (
    <button
      onClick={onClick}
      disabled={variant === 'topic'}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {label}
    </button>
  );
}
