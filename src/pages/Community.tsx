import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Community() {
  const { profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [filter, setFilter] = useState<'global' | 'friends'>('global');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, total_points, level, current_streak')
      .order('total_points', { ascending: false })
      .limit(100);

    setLeaderboard(data || []);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const userRank = leaderboard.findIndex((user) => user.id === profile?.id) + 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community & Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compete with others and celebrate successes together
        </p>
      </div>

      {userRank > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Rank</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">#{userRank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Points</p>
                <p className="text-3xl font-bold text-[#4CAF50]">{profile?.total_points || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-[#4CAF50]" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          variant={filter === 'global' ? 'primary' : 'outline'}
          onClick={() => setFilter('global')}
        >
          Global
        </Button>
        <Button
          variant={filter === 'friends' ? 'primary' : 'outline'}
          onClick={() => setFilter('friends')}
        >
          Friends
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 100 Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.slice(0, 20).map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  user.id === profile?.id
                    ? 'bg-green-100 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="w-8 text-center font-bold text-gray-600 dark:text-gray-400">
                  {getRankIcon(index) || `#${index + 1}`}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.name}
                    {user.id === profile?.id && (
                      <Badge variant="success" className="ml-2">
                        You
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Level {user.level} • {user.current_streak} day streak
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#4CAF50]">{user.total_points}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-semibold">
                  S
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Sarah Johnson</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "I've reduced my food waste by 60% in just 3 months! FOOPTRA helped me understand my patterns and make better choices."
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="success">60% Reduction</Badge>
                    <Badge variant="info">90 Day Streak</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
