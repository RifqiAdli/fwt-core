import { useState } from 'react';
import { Search, Refrigerator, ShoppingCart, ChefHat, Package, Star, Sparkles, Loader2, Copy, Check } from 'lucide-react';
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

  const GEMINI_API_KEY = 'AIzaSyBhqZzI-l8ouFQQWa_HDo9jpzYLrOhJMbU';

  const categories = [
    { id: 'all', name: 'All Tips' },
    { id: 'storage', name: 'Storage' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'cooking', name: 'Cooking' },
    { id: 'leftovers', name: 'Leftovers' },
  ];

  const tips = [
    {
      id: 1,
      title: 'Store Vegetables Properly',
      description: 'Keep vegetables in the crisper drawer with proper humidity settings to extend freshness.',
      category: 'storage',
      icon: Refrigerator,
    },
    {
      id: 2,
      title: 'Make a Shopping List',
      description: 'Plan meals and create a shopping list to avoid overbuying and reduce impulse purchases.',
      category: 'shopping',
      icon: ShoppingCart,
    },
    {
      id: 3,
      title: 'Use "First In, First Out"',
      description: 'Organize your fridge so older items are in front and used before newer ones.',
      category: 'storage',
      icon: Refrigerator,
    },
    {
      id: 4,
      title: 'Embrace Imperfect Produce',
      description: 'Buy ugly fruits and vegetables - they taste the same and reduce agricultural waste.',
      category: 'shopping',
      icon: ShoppingCart,
    },
    {
      id: 5,
      title: 'Cook with Scraps',
      description: 'Use vegetable scraps to make broths, and fruit peels for zests and preserves.',
      category: 'cooking',
      icon: ChefHat,
    },
    {
      id: 6,
      title: 'Freeze Leftovers',
      description: 'Portion and freeze leftovers within 2 hours of cooking for future quick meals.',
      category: 'leftovers',
      icon: Package,
    },
  ];

  const challenges = [
    {
      id: 1,
      title: 'Zero Waste Week',
      description: 'Try to produce zero food waste for an entire week',
      reward: 500,
      participants: 1234,
    },
    {
      id: 2,
      title: 'Veggie Saver',
      description: 'Reduce vegetable waste by 50% this month',
      reward: 300,
      participants: 856,
    },
    {
      id: 3,
      title: 'Meal Prep Master',
      description: 'Plan and prep all meals for a week to minimize waste',
      reward: 200,
      participants: 2341,
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
    // Bold: **text** or __text__
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');

    // Italic: *text* or _text_
    text = text.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    text = text.replace(/_(.+?)_/g, '<em class="italic">$1</em>');

    // Code: `text`
    text = text.replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">$1</code>');

    return text;
  };

  const formatAiResponse = (text) => {
    if (!text) return null;

    const lines = text.split('\n');

    return lines.map((line, index) => {
      // Handle headers (## or ### )
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

      // Handle numbered lists
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

      // Handle bullet points
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

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }

      // Regular paragraphs
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tips & Challenges</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn how to reduce waste and take on community challenges
        </p>
      </div>

      {/* AI Tips Section */}
      <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Tips Assistant
            </h2>
            <Badge variant="success" className="ml-auto">Powered by Gemini</Badge>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            Get personalized tips to reduce food waste based on your situation
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Example: I have many vegetables that are almost spoiled..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && getAiTips()}
              className="flex-1"
            />
            <Button 
              variant="primary" 
              onClick={getAiTips}
              disabled={isLoadingAi || !aiQuery.trim()}
              className="w-full sm:w-auto"
            >
              {isLoadingAi ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Tips
                </>
              )}
            </Button>
          </div>

          {aiResponse && (
            <div className="mt-4 p-5 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Tips for You:</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
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

      <Card>
        <CardContent className="py-4">
          <Input
            type="text"
            placeholder="Search tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={20} />}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Food Waste Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <Card key={tip.id} hover>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-fit">
                    <Icon className="w-6 h-6 text-[#4CAF50]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tip.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{tip.description}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleReadMore(tip)}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Active Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} hover>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {challenge.title}
                  </h3>
                  <Badge variant="warning">
                    <Star size={14} className="mr-1" />
                    {challenge.reward} pts
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{challenge.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {challenge.participants.toLocaleString()} participants
                  </span>
                  <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    Finish
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