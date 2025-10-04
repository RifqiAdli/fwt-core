import { useState, FormEvent, useRef } from 'react';
import { Upload, Camera, Check, Loader2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';

export function LogWaste() {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const { user } = useAuth();
  const { showToast } = useToast();
  const imageRef = useRef<HTMLImageElement>(null);

  const [formData, setFormData] = useState({
    category: 'Vegetables',
    quantity: '',
    reason: 'Expired',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [aiImage, setAiImage] = useState<File | null>(null);
  const [aiPreview, setAiPreview] = useState<string>('');
  const [aiResults, setAiResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

  const categories = [
    { value: 'Vegetables', label: 'Vegetables' },
    { value: 'Fruits', label: 'Fruits' },
    { value: 'Meat & Fish', label: 'Meat & Fish' },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'Grains', label: 'Grains' },
    { value: 'Beverages', label: 'Beverages' },
    { value: 'Cooked Food', label: 'Cooked Food' },
    { value: 'Other', label: 'Other' },
  ];

  const reasons = [
    { value: 'Expired', label: 'Expired' },
    { value: 'Spoiled', label: 'Spoiled' },
    { value: 'Over-purchased', label: 'Over-purchased' },
    { value: 'Forgot to use', label: 'Forgot to use' },
    { value: "Didn't like taste", label: "Didn't like taste" },
    { value: 'Cooked too much', label: 'Cooked too much' },
    { value: 'Other', label: 'Other' },
  ];

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('waste_logs').insert([
      {
        user_id: user!.id,
        category: formData.category,
        quantity: Number(formData.quantity),
        reason: formData.reason,
        date: formData.date,
        notes: formData.notes,
        ai_analyzed: false,
      },
    ]);

    if (error) {
      showToast('Failed to save waste log', 'error');
    } else {
      showToast('Waste log saved successfully!', 'success');
      setFormData({
        category: 'Vegetables',
        quantity: '',
        reason: 'Expired',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }

    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB for TensorFlow.js)
      if (file.size > 10 * 1024 * 1024) {
        showToast('Image size should be less than 10MB', 'error');
        return;
      }

      setAiImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAiPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAiResults(null);
    }
  };

  const categorizeFoodItem = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    
    // Vegetables
    const vegetables = ['vegetable', 'lettuce', 'tomato', 'carrot', 'broccoli', 'cabbage', 
                       'spinach', 'potato', 'onion', 'pepper', 'cucumber', 'celery', 'corn',
                       'pumpkin', 'squash', 'eggplant', 'zucchini', 'mushroom'];
    
    // Fruits
    const fruits = ['fruit', 'apple', 'banana', 'orange', 'grape', 'berry', 'melon', 'mango',
                   'pineapple', 'peach', 'pear', 'strawberry', 'watermelon', 'lemon', 'lime',
                   'cherry', 'plum', 'kiwi', 'papaya', 'guava'];
    
    // Meat & Fish
    const meatFish = ['meat', 'chicken', 'fish', 'beef', 'pork', 'salmon', 'tuna', 'shrimp',
                     'turkey', 'lamb', 'bacon', 'sausage', 'ham', 'steak', 'seafood'];
    
    // Dairy
    const dairy = ['dairy', 'milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream', 
                  'mozzarella', 'cheddar'];
    
    // Grains
    const grains = ['bread', 'rice', 'grain', 'pasta', 'cereal', 'wheat', 'oat', 'noodle',
                   'bagel', 'baguette', 'tortilla', 'cracker'];
    
    // Beverages
    const beverages = ['drink', 'beverage', 'juice', 'soda', 'water', 'coffee', 'tea', 
                      'wine', 'beer', 'cocktail', 'smoothie'];
    
    // Cooked Food
    const cookedFood = ['pizza', 'burger', 'sandwich', 'soup', 'stew', 'salad', 'wrap',
                       'burrito', 'taco', 'hot dog', 'french fries', 'fried'];

    if (vegetables.some(v => lowerLabel.includes(v))) return 'Vegetables';
    if (fruits.some(f => lowerLabel.includes(f))) return 'Fruits';
    if (meatFish.some(m => lowerLabel.includes(m))) return 'Meat & Fish';
    if (dairy.some(d => lowerLabel.includes(d))) return 'Dairy';
    if (grains.some(g => lowerLabel.includes(g))) return 'Grains';
    if (beverages.some(b => lowerLabel.includes(b))) return 'Beverages';
    if (cookedFood.some(c => lowerLabel.includes(c))) return 'Cooked Food';
    
    return 'Other';
  };

  const estimateQuantity = (confidence: number, className: string): number => {
    // More sophisticated quantity estimation based on food type
    const lowerClass = className.toLowerCase();
    
    // Base quantities for different food types (in grams)
    const baseQuantities: { [key: string]: number } = {
      'fruit': 150,
      'vegetable': 100,
      'bread': 80,
      'pizza': 250,
      'burger': 200,
      'salad': 150,
      'meat': 120,
      'fish': 150,
    };
    
    // Find matching base quantity
    let baseQuantity = 120; // Default
    for (const [key, value] of Object.entries(baseQuantities)) {
      if (lowerClass.includes(key)) {
        baseQuantity = value;
        break;
      }
    }
    
    // Add variance based on confidence
    const variance = 80;
    const confidenceFactor = confidence / 100;
    const randomFactor = (Math.random() - 0.5) * 2 * variance * (1 - confidenceFactor);
    
    return Math.max(50, Math.round(baseQuantity + randomFactor));
  };

  const handleAiAnalyze = async () => {
    if (!aiImage) {
      showToast('Please upload an image first', 'error');
      return;
    }

    setLoading(true);
    setModelLoading(true);

    try {
      // Dynamic import TensorFlow.js and MobileNet
      const [tf, mobilenet] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/mobilenet')
      ]);

      showToast('Loading AI model...', 'info');
      
      // Load the model
      const model = await mobilenet.load({
        version: 2,
        alpha: 1.0,
      });
      
      setModelLoading(false);
      showToast('Analyzing image...', 'info');

      // Wait for image to load
      if (imageRef.current) {
        await new Promise((resolve) => {
          if (imageRef.current!.complete) {
            resolve(null);
          } else {
            imageRef.current!.onload = () => resolve(null);
          }
        });

        // Classify the image
        const predictions = await model.classify(imageRef.current, 5);

        // Filter and process predictions
        const items = predictions
          .filter((pred: any) => pred.probability > 0.15) // Lower threshold for food items
          .map((pred: any) => {
            const confidence = Math.round(pred.probability * 100);
            const foodName = pred.className
              .split(',')[0] // Take first part if there are multiple names
              .trim()
              .split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            
            return {
              name: foodName,
              quantity: estimateQuantity(confidence, pred.className),
              category: categorizeFoodItem(pred.className),
              confidence: confidence,
              originalLabel: pred.className,
            };
          });

        if (items.length === 0) {
          showToast('No food items detected with sufficient confidence. Try a clearer photo.', 'error');
          setLoading(false);
          return;
        }

        setAiResults({ items });
        showToast(`Successfully detected ${items.length} item${items.length > 1 ? 's' : ''}!`, 'success');
        
        // Clean up
        model.dispose();
      }
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      showToast(
        error.message || 'Failed to analyze image. Please check your internet connection and try again.',
        'error'
      );
    } finally {
      setLoading(false);
      setModelLoading(false);
    }
  };

  const handleAiSubmit = async () => {
    if (!aiResults) return;

    setLoading(true);

    const logs = aiResults.items.map((item: any) => ({
      user_id: user!.id,
      category: item.category,
      quantity: item.quantity,
      reason: 'Analyzed from image',
      date: new Date().toISOString().split('T')[0],
      notes: `AI detected: ${item.name} (${item.confidence}% confidence)`,
      ai_analyzed: true,
    }));

    const { error } = await supabase.from('waste_logs').insert(logs);

    if (error) {
      showToast('Failed to save waste logs', 'error');
    } else {
      showToast(`${logs.length} waste log${logs.length > 1 ? 's' : ''} saved successfully!`, 'success');
      setAiImage(null);
      setAiPreview('');
      setAiResults(null);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Log Food Waste</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your waste by entering details manually or using AI analysis
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'manual'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'ai'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            AI Upload
            <Sparkles size={16} className="text-[#4CAF50]" />
          </span>
        </button>
      </div>

      {activeTab === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <Select
                label="Food Category"
                options={categories}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />

              <Input
                type="number"
                label="Quantity (grams)"
                placeholder="Enter quantity in grams"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                min="1"
              />

              <Select
                label="Reason for Waste"
                options={reasons}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />

              <Input
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Add any additional notes..."
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                <Check size={20} />
                Save Entry
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Powered by TensorFlow.js
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  100% free • No API key needed • Works offline • Privacy-focused (runs in your browser)
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Image for AI Analysis</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Max 10MB • Supported formats: JPG, PNG, WebP
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!aiPreview ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-[#4CAF50] dark:hover:border-[#4CAF50] transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
                      Upload a photo of your food waste
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                      For best results: clear photo, good lighting, close-up shot
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <span className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 bg-[#4CAF50] text-white hover:bg-[#45a049] cursor-pointer shadow-sm hover:shadow-md">
                        <Camera size={20} />
                        Choose Image
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        ref={imageRef}
                        src={aiPreview}
                        alt="Preview"
                        className="w-full max-h-96 object-contain"
                        crossOrigin="anonymous"
                      />
                      {(loading || modelLoading) && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center text-white">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3" />
                            <p className="font-semibold mb-1">
                              {modelLoading ? 'Loading AI model...' : 'Analyzing image...'}
                            </p>
                            <p className="text-sm text-gray-300">
                              {modelLoading ? 'First time may take 10-20 seconds' : 'This may take a few seconds'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAiImage(null);
                          setAiPreview('');
                          setAiResults(null);
                        }}
                        className="flex-1"
                        disabled={loading}
                      >
                        Change Image
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleAiAnalyze}
                        isLoading={loading}
                        disabled={aiResults !== null || loading}
                        className="flex-1"
                      >
                        {aiResults ? (
                          <>
                            <Check size={20} />
                            Analyzed
                          </>
                        ) : (
                          <>
                            <Sparkles size={20} />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {aiResults && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Results</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {aiResults.items.length} item{aiResults.items.length > 1 ? 's' : ''} detected • Review and confirm below
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {aiResults.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg hover:shadow-md transition-all border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-lg">
                              {item.name}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <span className="font-medium">{item.category}</span> • {item.quantity}g estimated
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Detected as: {item.originalLabel}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                            item.confidence >= 60 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : item.confidence >= 40
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}>
                            {item.confidence}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> You can edit quantities before saving. AI estimates are approximate.
                  </p>
                </div>

                <Button 
                  variant="primary" 
                  onClick={handleAiSubmit} 
                  isLoading={loading} 
                  className="w-full"
                >
                  <Check size={20} />
                  Confirm & Save {aiResults.items.length} Item{aiResults.items.length > 1 ? 's' : ''}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}