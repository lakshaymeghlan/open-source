import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-teal-400" />
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/50',
    error: 'bg-red-500/10 border-red-500/50',
    info: 'bg-teal-500/10 border-teal-500/50'
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${bgColors[type]} backdrop-blur-sm shadow-xl min-w-[320px]`}>
        {icons[type]}
        <span className="text-sm text-gray-200 flex-1">{message}</span>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
