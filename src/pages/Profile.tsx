import { useState, FormEvent } from 'react';
import { Camera, Moon, Sun, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(profile?.settings?.appearance?.theme === 'dark');

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }

    setLoading(false);
  };

  const toggleDarkMode = async () => {
    const newTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);

    try {
      await updateProfile({
        settings: {
          ...profile!.settings,
          appearance: {
            ...profile!.settings.appearance,
            theme: newTheme,
          },
        },
      });
      document.documentElement.classList.toggle('dark');
      showToast(`Switched to ${newTheme} mode`, 'success');
    } catch (error) {
      showToast('Failed to update theme', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile & Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-semibold">
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-[#4CAF50] text-white rounded-full shadow-lg hover:bg-[#45a049] transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{profile?.name}</h3>
              <div className="flex gap-2 mt-2">
                <Badge variant="success">Level {profile?.level}</Badge>
                <Badge variant="info">{profile?.total_points} XP</Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Tell us about yourself..."
              />
            </div>

            <Input
              type="text"
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              icon={<Globe size={20} />}
              placeholder="City, Country"
            />

            <Button type="submit" variant="primary" isLoading={loading}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.current_streak}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.longest_streak}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.level}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-[#4CAF50]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#4CAF50]">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#4CAF50]">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Profile Visibility</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Make profile visible to others</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#4CAF50]">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Show on Leaderboard</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Appear on public leaderboard</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#4CAF50]">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
