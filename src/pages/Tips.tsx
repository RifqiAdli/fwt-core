import { useState } from 'react';
import { Search, Refrigerator, ShoppingCart, ChefHat, Package, Star, Sparkles, Loader2, Copy, Check, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function Tips() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const GEMINI_API_KEY = 'AIzaSyDoaIfG4ZRH7boOaFk3YVCoSDD4ny9wq2o';

  const categories = [
    { id: 'all', name: 'All Tips', icon: Sparkles },
    { id: 'storage', name: 'Storage', icon: Refrigerator },
    { id: 'shopping', name: 'Shopping', icon: ShoppingCart },
    { id: 'cooking', name: 'Cooking', icon: ChefHat },
    { id: 'leftovers', name: 'Leftovers', icon: Package },
  ];

  const tips = [
    {
      id: 1,
      title: 'Store Vegetables Properly',
      description: 'Keep vegetables in the crisper drawer with proper humidity settings to extend freshness.',
      category: 'storage',
      icon: Refrigerator,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      id: 2,
      title: 'Make a Shopping List',
      description: 'Plan meals and create a shopping list to avoid overbuying and reduce impulse purchases.',
      category: 'shopping',
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      id: 3,
      title: 'Use "First In, First Out"',
      description: 'Organize your fridge so older items are in front and used before newer ones.',
      category: 'storage',
      icon: Refrigerator,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      id: 4,
      title: 'Embrace Imperfect Produce',
      description: 'Buy ugly fruits and vegetables - they taste the same and reduce agricultural waste.',
      category: 'shopping',
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      id: 5,
      title: 'Cook with Scraps',
      description: 'Use vegetable scraps to make broths, and fruit peels for zests and preserves.',
      category: 'cooking',
      icon: ChefHat,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      id: 6,
      title: 'Freeze Leftovers',
      description: 'Portion and freeze leftovers within 2 hours of cooking for future quick meals.',
      category: 'leftovers',
      icon: Package,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50 dark:bg-teal-950',
    },
  ];

  const challenges = [
    {
      id: 1,
      title: 'Zero Waste Week',
      description: 'Try to produce zero food waste for an entire week',
      reward: 500,
      participants: 1234,
      progress: 65,
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      id: 2,
      title: 'Veggie Saver',
      description: 'Reduce vegetable waste by 50% this month',
      reward: 300,
      participants: 856,
      progress: 45,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 3,
      title: 'Meal Prep Master',
      description: 'Plan and prep all meals for a week to minimize waste',
      reward: 200,
      participants: 2341,
      progress: 80,
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  const filteredTips = tips.filter(
    (tip) =>
      (activeCategory === 'all' || tip.category === activeCategory) &&
      (tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getAiTips = async () => {
    if (!aiQuery.trim()) return;

    setIsLoadingAi(true);
    setAiResponse('');
    setIsCopied(false);

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `As a food waste reduction expert, provide practical and specific tips for this situation: "${aiQuery}". Give 3-5 actionable tips that are short and easy to implement. Format them in friendly and easy-to-understand English with clear formatting.`
              }]
            }]
          })
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        setAiResponse(data.candidates[0].content.parts[0].text);
      } else {
        setAiResponse('Sorry, unable to generate tips at the moment. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching AI tips:', error);
      setAiResponse('An error occurred while connecting to AI. Please make sure your internet connection is stable and try again.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(aiResponse);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatInlineMarkdown = (text) => {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    text = text.replace(/_(.+?)_/g, '<em class="italic">$1</em>');
    text = text.replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">$1</code>');
    return text;
  };

  const formatAiResponse = (text) => {
    if (!text) return null;

    const lines = text.split('\n');

    return lines.map((line, index) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-base font-bold text-gray-900 dark:text-white mt-3 mb-2">
            {line.replace('### ', '')}
          </h4>
        );
      }

      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">
            {line.replace('## ', '')}
          </h3>
        );
      }

      if (/^\d+\./.test(line.trim())) {
        const content = line.replace(/^\d+\.\s*/, '');
        const number = line.match(/^\d+/)[0];
        return (
          <div key={index} className="flex gap-3 mb-3">
            <span className="font-bold text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">
              {number}.
            </span>
            <span 
              className="flex-1" 
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} 
            />
          </div>
        );
      }

      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.replace(/^[\s]*[*-]\s*/, '');
        return (
          <div key={index} className="flex gap-3 mb-2 ml-2">
            <span className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1">•</span>
            <span 
              className="flex-1" 
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} 
            />
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }

      return (
        <p 
          key={index} 
          className="mb-3 leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} 
        />
      );
    });
  };

  const handleReadMore = (tip) => {
    setAiQuery(`Tell me more about: ${tip.title}. ${tip.description}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      getAiTips();
    }, 300);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Tips & Challenges</h1>
              <p className="text-green-50 mt-1">
                Learn, grow, and make a difference together
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <TrendingUp className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-green-50">Active Tips</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Users className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">4.5K</p>
              <p className="text-sm text-green-50">Members</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Award className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">1000</p>
              <p className="text-sm text-green-50">Rewards</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tips Section */}
      <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 shadow-lg overflow-hidden">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Tips Assistant
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by Google Gemini AI
              </p>
            </div>
            <Badge variant="success" className="hidden sm:flex">🤖 AI Powered</Badge>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            Get personalized, intelligent tips to reduce food waste based on your unique situation
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Example: I have many vegetables that are almost spoiled..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && getAiTips()}
                className="pr-10"
              />
              {aiQuery && (
                <button
                  onClick={() => setAiQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <Button 
              variant="primary" 
              onClick={getAiTips}
              disabled={isLoadingAi || !aiQuery.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
              {isLoadingAi ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Tips
                </>
              )}
            </Button>
          </div>

          {aiResponse && (
            <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-200 dark:border-green-700 shadow-lg animate-in fade-in duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">AI Tips for You</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generated by Gemini AI</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {formatAiResponse(aiResponse)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="shadow-md">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tips by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex gap-3 flex-wrap">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 transition-all ${
                activeCategory === category.id 
                  ? 'shadow-lg scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              <CategoryIcon className="w-4 h-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Tips Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Food Waste Tips
          </h2>
          <Badge variant="outline">{filteredTips.length} tips available</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <Card 
                key={tip.id} 
                hover 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="space-y-4">
                  <div className={`p-4 bg-gradient-to-br ${tip.color} rounded-xl w-fit shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleReadMore(tip)}
                    className="w-full justify-center gap-2 group-hover:bg-green-50 dark:group-hover:bg-green-950 group-hover:text-green-600 dark:group-hover:text-green-400 font-medium"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Challenges Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Active Challenges
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Join the community and earn rewards
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card 
              key={challenge.id} 
              hover 
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {challenge.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${challenge.gradient} rounded-xl shadow-lg ml-3`}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-bold text-gray-900 dark:text-white">{challenge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${challenge.gradient} rounded-full transition-all duration-500`}
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold">{challenge.reward}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{challenge.participants.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className={`bg-gradient-to-r ${challenge.gradient} hover:opacity-90 text-white shadow-lg font-medium`}
                  >
                    Join Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}