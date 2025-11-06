interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Card({ children, hover = false, onClick, className = '' }: CardProps) {
  const baseClasses = 'bg-[#0f1728] rounded-2xl border border-gray-800/50 transition-all duration-200';
  const hoverClasses = hover ? 'hover:translate-y-[-2px] hover:shadow-xl hover:border-teal-500/30 cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
}
