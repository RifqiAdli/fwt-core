import { useState, FormEvent, useRef } from 'react';
import { Camera, Moon, Sun, Globe, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [darkMode, setDarkMode] = useState(profile?.settings?.appearance?.theme === 'dark');
  const [emailNotifications, setEmailNotifications] = useState(
    profile?.settings?.notifications?.email ?? true
  );
  const [pushNotifications, setPushNotifications] = useState(
    profile?.settings?.notifications?.push ?? true
  );
  const [profileVisibility, setProfileVisibility] = useState(
    profile?.settings?.privacy?.profile_visible ?? true
  );
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(
    profile?.settings?.privacy?.show_on_leaderboard ?? true
  );

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 2MB for base64)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Update profile with base64 avatar
        await updateProfile({ avatar_url: base64String });
        
        showToast('Profile picture updated successfully!', 'success');
        setUploadingAvatar(false);
      };

      reader.onerror = () => {
        showToast('Failed to read image file', 'error');
        setUploadingAvatar(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      showToast(error.message || 'Failed to upload profile picture', 'error');
      setUploadingAvatar(false);
    }
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
      setDarkMode(!newTheme); // Revert on error
    }
  };

  const toggleEmailNotifications = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);

    try {
      await updateProfile({
        settings: {
          ...profile!.settings,
          notifications: {
            ...profile!.settings.notifications,
            email: newValue,
          },
        },
      });
      showToast(`Email notifications ${newValue ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      showToast('Failed to update notification settings', 'error');
      setEmailNotifications(!newValue); // Revert on error
    }
  };

  const togglePushNotifications = async () => {
    const newValue = !pushNotifications;
    setPushNotifications(newValue);

    try {
      await updateProfile({
        settings: {
          ...profile!.settings,
          notifications: {
            ...profile!.settings.notifications,
            push: newValue,
          },
        },
      });
      showToast(`Push notifications ${newValue ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      showToast('Failed to update notification settings', 'error');
      setPushNotifications(!newValue); // Revert on error
    }
  };

  const toggleProfileVisibility = async () => {
    const newValue = !profileVisibility;
    setProfileVisibility(newValue);

    try {
      await updateProfile({
        settings: {
          ...profile!.settings,
          privacy: {
            ...profile!.settings.privacy,
            profile_visible: newValue,
          },
        },
      });
      showToast(`Profile visibility ${newValue ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      showToast('Failed to update privacy settings', 'error');
      setProfileVisibility(!newValue); // Revert on error
    }
  };

  const toggleShowOnLeaderboard = async () => {
    const newValue = !showOnLeaderboard;
    setShowOnLeaderboard(newValue);

    try {
      await updateProfile({
        settings: {
          ...profile!.settings,
          privacy: {
            ...profile!.settings.privacy,
            show_on_leaderboard: newValue,
          },
        },
      });
      showToast(`Leaderboard visibility ${newValue ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      showToast('Failed to update privacy settings', 'error');
      setShowOnLeaderboard(!newValue); // Revert on error
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
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-semibold">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-[#4CAF50] text-white rounded-full shadow-lg hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change profile picture"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{profile?.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{profile?.email}</p>
              <div className="flex gap-2">
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
              placeholder="Enter your full name"
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
              <button
                onClick={toggleEmailNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-[#4CAF50]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications</p>
              </div>
              <button
                onClick={togglePushNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pushNotifications ? 'bg-[#4CAF50]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
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
              <button
                onClick={toggleProfileVisibility}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profileVisibility ? 'bg-[#4CAF50]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profileVisibility ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Show on Leaderboard</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Appear on public leaderboard</p>
              </div>
              <button
                onClick={toggleShowOnLeaderboard}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showOnLeaderboard ? 'bg-[#4CAF50]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showOnLeaderboard ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}