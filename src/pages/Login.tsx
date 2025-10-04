import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      showToast(error.message || 'Failed to sign in', 'error');
      setLoading(false);
    } else {
      showToast('Welcome back to FOOPTRA!', 'success');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf className="w-12 h-12 text-[#4CAF50]" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">FOOPTRA</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Sign in to continue your eco-journey.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail size={20} />}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock size={20} />}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>

              <Link to="/forgot-password" className="text-sm text-[#4CAF50] hover:text-[#45a049]">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#4CAF50] hover:text-[#45a049] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
