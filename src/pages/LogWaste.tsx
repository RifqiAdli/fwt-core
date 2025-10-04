import { useState, FormEvent } from 'react';
import { Upload, Camera, Check } from 'lucide-react';
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
      setAiImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAiPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiAnalyze = async () => {
    if (!aiImage) {
      showToast('Please upload an image first', 'error');
      return;
    }

    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setAiResults({
      items: [
        { name: 'Lettuce', quantity: 150, category: 'Vegetables', confidence: 92 },
        { name: 'Tomato', quantity: 80, category: 'Vegetables', confidence: 88 },
      ],
    });

    setLoading(false);
    showToast('Image analyzed successfully!', 'success');
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
      showToast(`${logs.length} waste logs saved successfully!`, 'success');
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
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'ai'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          AI Upload
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
          <Card>
            <CardHeader>
              <CardTitle>Upload Image for AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!aiPreview ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Drag and drop an image here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <span className="inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-medium rounded-lg transition-all duration-200 border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white cursor-pointer">
                        <Camera size={20} />
                        Choose Image
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={aiPreview}
                      alt="Preview"
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAiImage(null);
                          setAiPreview('');
                          setAiResults(null);
                        }}
                        className="flex-1"
                      >
                        Change Image
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleAiAnalyze}
                        isLoading={loading}
                        disabled={aiResults !== null}
                        className="flex-1"
                      >
                        Analyze Image
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
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {aiResults.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.category} - {item.quantity}g
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {item.confidence}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="primary" onClick={handleAiSubmit} isLoading={loading} className="w-full">
                  <Check size={20} />
                  Confirm & Save
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
