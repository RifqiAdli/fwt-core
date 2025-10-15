import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TrendingDown, TrendingUp, Calendar, AlertCircle, Award, Target, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Analytics() {
  const { user, profile } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const GEMINI_API_KEY = 'AIzaSyDoaIfG4ZRH7boOaFk3YVCoSDD4ny9wq2o';

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

  // AI Analysis Function
  const generateAIInsights = async () => {
    if (wasteLogs.length === 0) {
      setAiInsights('No waste data available to analyze. Start logging your food waste!');
      return;
    }

    setAiLoading(true);
    
    try {
      // Prepare waste data summary
      const totalWaste = getTotalWaste();
      const avgDaily = getAverageDaily();
      const [mostWastedCategory, categoryAmount] = getMostWastedCategory();
      const [mostCommonReason] = getMostCommonReason();
      const peakDay = getPeakWasteDay();
      const trend = getWasteTrend();
      
      const categoryBreakdown = getCategoryData()
        .map(c => `${c.category}: ${c.value}g`)
        .join(', ');
      
      const reasonBreakdown = getReasonData()
        .slice(0, 3)
        .map(r => `${r.reason}: ${r.value}g`)
        .join(', ');

      const prompt = `As a food waste management expert, analyze the following data and provide personalized recommendations in English (maximum 350 words). Use markdown formatting for better readability:

WASTE DATA (${timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : timeRange === 'quarter' ? 'This Quarter' : 'This Year'}):
- Total waste: ${Math.round(totalWaste)}g
- Daily average: ${avgDaily}g
- Trend: ${trend > 0 ? `Up ${trend}%` : trend < 0 ? `Down ${Math.abs(trend)}%` : 'Stable'}
- Most wasted category: ${mostWastedCategory} (${Math.round(categoryAmount as number)}g)
- Main reason: ${mostCommonReason}
- Peak day: ${peakDay}
- Category breakdown: ${categoryBreakdown}
- Reason breakdown: ${reasonBreakdown}

Please provide:

**📊 Waste Pattern Analysis**
2-3 sentences analyzing the key patterns and trends

**💡 Actionable Recommendations**
Provide 4-5 specific, practical tips to reduce waste. Use bullet points with clear action items.

**🎯 Target for Next Period**
Suggest a realistic, measurable goal based on current performance

Use a supportive, encouraging tone. Focus on practical solutions. Use markdown formatting including **bold** for emphasis, bullet points for lists, and clear section headers.`;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate AI insights');
      }

      const data = await response.json();
      const insights = data.candidates[0].content.parts[0].text;
      setAiInsights(insights);
    } catch (error) {
      console.error('AI Insights Error:', error);
      setAiInsights('Sorry, an error occurred while generating AI insights. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(aiInsights);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Parse markdown to HTML
  const parseMarkdown = (text: string) => {
    return text
      // Bold text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">$1</h2>')
      // Bullet points
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc space-y-1 my-2">$1</ul>')
      // Line breaks
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
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

    return 0;
  };

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'];

  const trend = getWasteTrend();
  const [mostWastedCategory, categoryAmount] = getMostWastedCategory();
  const [mostCommonReason] = getMostCommonReason();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Insights</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Deep dive into your waste patterns</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="flex-1 sm:flex-none min-w-[70px]"
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* AI Insights Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-purple-900 dark:text-purple-100">AI-Powered Insights</CardTitle>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={generateAIInsights}
              disabled={aiLoading || wasteLogs.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiInsights ? (
            <div>
              <div className="flex justify-end mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Text
                    </>
                  )}
                </Button>
              </div>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(aiInsights) }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Get personalized AI analysis
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Click "Generate Insights" to get AI-powered recommendations based on your waste patterns
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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