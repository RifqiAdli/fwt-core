import { useState, useEffect } from 'react';
import { TrendingDown, Droplet, MapPin, Cloud, Award, Trophy, Flame, Trash2 } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

interface WasteLog {
  id: string;
  category: string;
  quantity: number;
  reason: string;
  date: string;
  created_at: string;
}

interface Stats {
  todayWaste: number;
  weekWaste: number;
  monthWaste: number;
  totalWaste: number;
  co2Saved: number;
  waterSaved: number;
  landSaved: number;
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayWaste: 0,
    weekWaste: 0,
    monthWaste: 0,
    totalWaste: 0,
    co2Saved: 0,
    waterSaved: 0,
    landSaved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    const { data: logs, error } = await supabase
      .from('waste_logs')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(100);

    if (error) {
      showToast('Failed to fetch waste logs', 'error');
      setLoading(false);
      return;
    }

    setWasteLogs(logs || []);
    calculateStats(logs || []);
    setLoading(false);
  };

  const calculateStats = (logs: WasteLog[]) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayWaste = logs.filter(l => l.date === today).reduce((sum, l) => sum + Number(l.quantity), 0);
    const weekWaste = logs.filter(l => l.date >= weekAgo).reduce((sum, l) => sum + Number(l.quantity), 0);
    const monthWaste = logs.filter(l => l.date >= monthAgo).reduce((sum, l) => sum + Number(l.quantity), 0);
    const totalWaste = logs.reduce((sum, l) => sum + Number(l.quantity), 0);

    const co2Saved = (totalWaste / 1000) * 2.5;
    const waterSaved = (totalWaste / 1000) * 1000;
    const landSaved = (totalWaste / 1000) * 0.5;

    setStats({
      todayWaste,
      weekWaste,
      monthWaste,
      totalWaste,
      co2Saved,
      waterSaved,
      landSaved,
    });
  };

  const deleteLog = async (id: string) => {
    const { error } = await supabase
      .from('waste_logs')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Failed to delete entry', 'error');
    } else {
      showToast('Entry deleted successfully', 'success');
      fetchData();
    }
  };

  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const dayWaste = wasteLogs
        .filter(l => l.date === dateStr)
        .reduce((sum, l) => sum + Number(l.quantity), 0);

      data.push({ day: dayName, waste: dayWaste });
    }
    return data;
  };

  const getCategoryData = () => {
    const categories = ['Vegetables', 'Fruits', 'Meat', 'Dairy', 'Grains', 'Other'];
    return categories.map(cat => ({
      name: cat,
      value: wasteLogs
        .filter(l => l.category.toLowerCase().includes(cat.toLowerCase()))
        .reduce((sum, l) => sum + Number(l.quantity), 0),
    })).filter(c => c.value > 0);
  };

  const COLORS = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#FF5722', '#9E9E9E'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {profile?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your food waste overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingDown className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Waste</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayWaste}g</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.weekWaste}g</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <TrendingDown className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.monthWaste}g</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Impact</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWaste}g</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>7-Day Waste Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getLast7DaysData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="waste" stroke="#4CAF50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waste by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryData().map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="text-center py-6">
            <Cloud className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.co2Saved.toFixed(1)} kg
            </p>
            <p className="text-gray-600 dark:text-gray-400">CO₂ Emissions Saved</p>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <Droplet className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.waterSaved.toFixed(0)} L
            </p>
            <p className="text-gray-600 dark:text-gray-400">Water Saved</p>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <MapPin className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.landSaved.toFixed(1)} m²
            </p>
            <p className="text-gray-600 dark:text-gray-400">Land Saved</p>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '58%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wasteLogs.slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No waste logs yet. Start tracking!</p>
              ) : (
                wasteLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default">{log.category}</Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {log.quantity}g - {log.reason}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} onClick={() => deleteLog(log.id)} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Flame className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {profile?.current_streak || 0} Day Streak
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Keep logging daily!</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">Level {profile?.level || 1}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profile?.total_points || 0} XP
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button variant="outline" size="sm">
                  View All Achievements
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
