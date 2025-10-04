import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '../components/ui/Button';
import { TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Analytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('waste_logs')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: true });

    setWasteLogs(data || []);
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((month, index) => {
      const monthWaste = wasteLogs
        .filter(log => new Date(log.date).getMonth() === index)
        .reduce((sum, log) => sum + Number(log.quantity), 0);
      return { month, waste: monthWaste };
    });
    return data;
  };

  const insights = [
    { title: 'Most wasted category', value: 'Vegetables', percent: '35%' },
    { title: 'Compared to average users', value: '23% less waste', percent: '+23%' },
    { title: 'Peak waste day', value: 'Sunday', percent: '' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="py-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{insight.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{insight.value}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-[#4CAF50]" />
              </div>
              {insight.percent && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">{insight.percent}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Waste Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="waste" stroke="#4CAF50" strokeWidth={2} name="Waste (g)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300">Reduce waste by 25%</span>
                <span className="text-[#4CAF50] font-semibold">18% achieved</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-[#4CAF50] h-3 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
