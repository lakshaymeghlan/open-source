import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  const variantClasses = {
    primary: 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30',
    secondary: 'bg-[#1a2332] text-gray-300 border border-gray-700/50 hover:bg-[#1f2937] hover:border-gray-600',
    ghost: 'text-gray-400 hover:text-gray-200 hover:bg-[#1a2332]',
    icon: 'text-gray-400 hover:text-gray-200 hover:bg-[#1a2332] p-2 min-h-[40px]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className={`${variant === 'icon' ? 'w-5 h-5' : 'w-4 h-4 mr-2'}`} />}
      {variant !== 'icon' && children}
    </button>
  );
}
