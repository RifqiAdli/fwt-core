import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Lightbulb,
  Users,
  User,
  Menu,
  X,
  LogOut,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Log Waste', href: '/log-waste', icon: PlusCircle },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Tips & Challenges', href: '/tips', icon: Lightbulb },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-[#4CAF50]" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">FOOPTRA</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 dark:text-gray-300"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-8 h-8 text-[#4CAF50]" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">FOOPTRA</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {profile?.name || 'User'}
                </p>
                <div className="flex items-center gap-1 text-sm text-[#FF9800]">
                  <Flame size={14} />
                  <span>{profile?.current_streak || 0} day streak</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#4CAF50] text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleSignOut}
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="pt-16 lg:pt-0">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
