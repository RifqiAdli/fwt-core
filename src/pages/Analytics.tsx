import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TrendingDown, TrendingUp, Calendar, AlertCircle, Award, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Analytics() {
  const { user, profile } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchLogs(), fetchGoals()]);
    setLoading(false);
  };

  const fetchLogs = async () => {
    const startDate = getStartDate();
    const { data } = await supabase
      .from('waste_logs')
      .select('*')
      .eq('user_id', user!.id)
      .gte('date', startDate)
      .order('date', { ascending: true });

    setWasteLogs(data || []);
  };

  const fetchGoals = async () => {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(3);

    setGoals(data || []);
  };

  const getStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString().split('T')[0];
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
    }
  };

  // Calculate statistics
  const getTotalWaste = () => {
    return wasteLogs.reduce((sum, log) => sum + Number(log.quantity), 0);
  };

  const getAverageDaily = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365;
    return Math.round(getTotalWaste() / days);
  };

  const getMostWastedCategory = () => {
    const categoryTotals = wasteLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + Number(log.quantity);
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
    return sorted[0] || ['N/A', 0];
  };

  const getMostCommonReason = () => {
    const reasonCounts = wasteLogs.reduce((acc, log) => {
      acc[log.reason] = (acc[log.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(reasonCounts).sort(([, a], [, b]) => b - a);
    return sorted[0] || ['N/A', 0];
  };

  const getPeakWasteDay = () => {
    const dayTotals = wasteLogs.reduce((acc, log) => {
      const day = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + Number(log.quantity);
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(dayTotals).sort(([, a], [, b]) => b - a);
    return sorted[0]?.[0] || 'N/A';
  };

  const getWasteTrend = () => {
    if (wasteLogs.length < 2) return 0;
    
    const firstHalf = wasteLogs.slice(0, Math.floor(wasteLogs.length / 2));
    const secondHalf = wasteLogs.slice(Math.floor(wasteLogs.length / 2));
    
    const firstHalfTotal = firstHalf.reduce((sum, log) => sum + Number(log.quantity), 0);
    const secondHalfTotal = secondHalf.reduce((sum, log) => sum + Number(log.quantity), 0);
    
    if (firstHalfTotal === 0) return 0;
    return Math.round(((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100);
  };

  // Chart data
  const getTimeSeriesData = () => {
    const grouped = wasteLogs.reduce((acc, log) => {
      const date = timeRange === 'week' || timeRange === 'month'
        ? new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : new Date(log.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      acc[date] = (acc[date] || 0) + Number(log.quantity);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, waste]) => ({
      date,
      waste: Math.round(waste),
    }));
  };

  const getCategoryData = () => {
    const categoryTotals = wasteLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + Number(log.quantity);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([category, value]) => ({
      category,
      value: Math.round(value),
    })).sort((a, b) => b.value - a.value);
  };

  const getReasonData = () => {
    const reasonCounts = wasteLogs.reduce((acc, log) => {
      acc[log.reason] = (acc[log.reason] || 0) + Number(log.quantity);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(reasonCounts).map(([reason, value]) => ({
      reason,
      value: Math.round(value),
    })).sort((a, b) => b.value - a.value);
  };

  const getGoalProgress = (goal: any) => {
    const goalStart = new Date(goal.start_date);
    const goalEnd = new Date(goal.end_date);
    const now = new Date();

    const logsInPeriod = wasteLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= goalStart && logDate <= goalEnd;
    });

    const totalWaste = logsInPeriod.reduce((sum, log) => sum + Number(log.quantity), 0);

    if (goal.target_quantity) {
      return Math.min(100, Math.round((1 - totalWaste / goal.target_quantity) * 100));
    }

    // For reduction percentage goals, compare with previous period
    return 0; // Simplified for now
  };

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'];

  const trend = getWasteTrend();
  const [mostWastedCategory, categoryAmount] = getMostWastedCategory();
  const [mostCommonReason] = getMostCommonReason();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">Deep dive into your waste patterns</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Waste</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(getTotalWaste())}g
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {timeRange === 'week' ? 'This week' : timeRange === 'month' ? 'This month' : timeRange === 'quarter' ? 'This quarter' : 'This year'}
                </p>
              </div>
              {trend !== 0 && (
                <div className={`flex items-center gap-1 ${trend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend < 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                  <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getAverageDaily()}g</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Per day</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Wasted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mostWastedCategory}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {Math.round(categoryAmount as number)}g total
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peak Day</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getPeakWasteDay()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Most waste on this day</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waste Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Waste Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {wasteLogs.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getTimeSeriesData()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="waste" 
                  stroke="#4CAF50" 
                  strokeWidth={3} 
                  name="Waste (g)"
                  dot={{ fill: '#4CAF50', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category & Reason Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Waste by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {getCategoryData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getCategoryData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waste by Reason</CardTitle>
          </CardHeader>
          <CardContent>
            {getReasonData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getReasonData()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="reason" className="text-xs" angle={-45} textAnchor="end" height={80} />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #ccc',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#4CAF50" name="Waste (g)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Active Goals</CardTitle>
            <Badge variant="info">{goals.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                const isCompleted = progress >= 100;
                
                return (
                  <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Reduce waste {goal.target_reduction_percent ? `by ${goal.target_reduction_percent}%` : `to ${goal.target_quantity}g`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      {isCompleted && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Award size={14} />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          isCompleted ? 'bg-green-500' : 'bg-[#4CAF50]'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {progress}% achieved
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No active goals</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Set goals to track your waste reduction progress
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights & Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trend < 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">Great progress!</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    You've reduced your waste by {Math.abs(trend)}% compared to the previous period. Keep it up!
                  </p>
                </div>
              </div>
            )}
            
            {mostWastedCategory !== 'N/A' && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">Focus Area</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    {mostWastedCategory} is your most wasted category. Consider meal planning and proper storage to reduce waste.
                  </p>
                </div>
              </div>
            )}

            {mostCommonReason !== 'N/A' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Top Waste Reason</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    "{mostCommonReason}" is your most common waste reason. Try setting reminders or buying smaller portions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}