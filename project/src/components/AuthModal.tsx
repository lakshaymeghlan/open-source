import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Github, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export default function AuthModal({ isOpen, onClose, mode, onToggleMode }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    console.log(`${mode}:`, { email, password });
  };

  const handleGitHubAuth = () => {
    console.log('GitHub auth clicked');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-2 text-center">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-400 text-center mb-6">
          {mode === 'signin'
            ? 'Sign in to manage your bookmarks and contributions'
            : 'Join to start discovering and contributing to open-source projects'}
        </p>

        <Button
          variant="secondary"
          size="lg"
          icon={Github}
          onClick={handleGitHubAuth}
          className="w-full mb-6"
        >
          Continue with GitHub
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800/50" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#0f1720] text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-[#0b0f14] border border-gray-800/50 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-[#0b0f14] border border-gray-800/50 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={onToggleMode}
            className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
