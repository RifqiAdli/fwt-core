import { useState } from 'react';
import { Search, Refrigerator, ShoppingCart, ChefHat, Package, Star } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function Tips() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tips & Challenges</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn how to reduce waste and take on community challenges
        </p>
      </div>

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
                  <Button variant="ghost" size="sm">
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
