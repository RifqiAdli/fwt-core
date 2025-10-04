import { ReactNode, useState, useEffect } from 'react';
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
  Bell,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Log Waste', href: '/log-waste', icon: PlusCircle },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Tips & Challenges', href: '/tips', icon: Lightbulb },
    { name: 'Community', href: '/community', icon: Users, badge: notifications },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();
      
      // Setup realtime for friend requests
      const subscription = supabase
        .channel('friend-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'friends',
            filter: `friend_id=eq.${profile.id}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [profile?.id]);

  const fetchNotifications = async () => {
    if (!profile?.id) return;

    const { data } = await supabase
      .from('friends')
      .select('id')
      .eq('friend_id', profile.id)
      .eq('status', 'pending');

    setNotifications(data?.length || 0);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelXP = (profile.level - 1) * 1000;
    const nextLevelXP = profile.level * 1000;
    const progress = ((profile.total_points - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-[#4CAF50]" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">FOOPTRA</span>
          </div>
          <div className="flex items-center gap-2">
            {notifications > 0 && (
              <button
                onClick={() => navigate('/community')}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              </button>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 dark:text-gray-300"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Profile */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-8 h-8 text-[#4CAF50]" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">FOOPTRA</span>
            </div>

            <div className="space-y-3">
              {/* Profile Info */}
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {profile?.name || 'User'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-xs px-2 py-0.5">
                      Level {profile?.level || 1}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-[#FF9800]">
                      <Flame size={12} />
                      <span>{profile?.current_streak || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>{profile?.total_points || 0} XP</span>
                  <span>{profile?.level ? profile.level * 1000 : 1000} XP</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getLevelProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                    active
                      ? 'bg-[#4CAF50] text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium flex-1">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
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

      {/* Main Content */}
      <div className="lg:pl-64">
        <div className="pt-16 lg:pt-0">
          <main className="p-6 max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}