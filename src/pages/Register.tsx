import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });

  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const getPasswordStrength = (pass: string) => {
    if (pass.length < 6) return { strength: 'weak', color: 'bg-red-500', text: 'Weak' };
    if (pass.length < 10) return { strength: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    return { strength: 'strong', color: 'bg-green-500', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  const validate = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: '',
    };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const { error } = await signUp(email, password, name);

    if (error) {
      showToast(error.message || 'Failed to create account', 'error');
      setLoading(false);
    } else {
      showToast('Account created successfully! Welcome to FOOPTRA!', 'success');
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
          <p className="text-gray-600 dark:text-gray-400">Join thousands reducing food waste worldwide.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              icon={<User size={20} />}
            />

            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail size={20} />}
            />

            <div>
              <Input
                type="password"
                label="Password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock size={20} />}
              />
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{
                          width:
                            passwordStrength.strength === 'weak'
                              ? '33%'
                              : passwordStrength.strength === 'medium'
                              ? '66%'
                              : '100%',
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock size={20} />}
            />

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <a href="#" className="text-[#4CAF50] hover:text-[#45a049]">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#4CAF50] hover:text-[#45a049]">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.terms}</p>
              )}
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#4CAF50] hover:text-[#45a049] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
