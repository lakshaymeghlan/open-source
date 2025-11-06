interface BadgeProps {
  label: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  variant?: 'difficulty' | 'default';
  size?: 'sm' | 'md';
}

export default function Badge({ label, difficulty, variant = 'default', size = 'md' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-semibold';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs'
  };

  const difficultyClasses = {
    easy: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50',
    medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/50',
    hard: 'bg-red-500/20 text-red-400 border border-red-500/50'
  };

  const defaultClasses = 'bg-[#1a2332] text-gray-400 border border-gray-700/50';

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${
        variant === 'difficulty' && difficulty ? difficultyClasses[difficulty] : defaultClasses
      }`}
    >
      {label}
    </span>
  );
}
