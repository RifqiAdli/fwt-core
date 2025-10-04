import { Link } from 'react-router-dom';
import { Leaf, Award, BarChart3, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-[#4CAF50]" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">FOOPTRA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

<section className="relative py-20 min-h-[600px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://medialibraryfbr.s3.us-east-2.amazonaws.com/wp-content/uploads/2022/12/04191305/volunteer-food-bank.jpg" 
            alt="Food background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-6">
              <Leaf className="w-20 h-20 text-[#4CAF50]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Track Your Food Waste. Build Eco-Conscious Habits.
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Join thousands of users reducing waste and saving the planet, one meal at a time.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Get Started Free
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose FOOPTRA?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to track and reduce your food waste
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card hover>
              <CardContent className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <Zap className="w-8 h-8 text-[#4CAF50]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Smart Tracking
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  AI-powered waste detection and easy manual logging to track every bit of food waste
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <BarChart3 className="w-8 h-8 text-[#4CAF50]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Real Impact
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See your environmental contribution with detailed analytics and impact metrics
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <Award className="w-8 h-8 text-[#4CAF50]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Gamification
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Earn badges, compete with friends, and unlock achievements as you reduce waste
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Global Impact
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Together, we're making a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#4CAF50] mb-2">50K+</div>
              <div className="text-xl text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#4CAF50] mb-2">2M kg</div>
              <div className="text-xl text-gray-600 dark:text-gray-400">Waste Reduced</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#4CAF50] mb-2">500K</div>
              <div className="text-xl text-gray-600 dark:text-gray-400">Trees Saved</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Four simple steps to start reducing waste
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4CAF50] text-white rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-400">Create your free account in seconds</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4CAF50] text-white rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Log Waste</h3>
              <p className="text-gray-600 dark:text-gray-400">Track your food waste easily</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4CAF50] text-white rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">View insights and analytics</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4CAF50] text-white rounded-full text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Earn Rewards</h3>
              <p className="text-gray-600 dark:text-gray-400">Unlock badges and compete</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join FOOPTRA today and start your journey to zero waste
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="bg-white text-[#4CAF50] hover:bg-gray-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-[#4CAF50]" />
                <span className="text-xl font-bold text-white">FOOPTRA</span>
              </div>
              <p className="text-sm">Building eco-conscious eating habits, one meal at a time.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#4CAF50]">Features</a></li>
                <li><a href="#" className="hover:text-[#4CAF50]">Pricing</a></li>
                <li><a href="#" className="hover:text-[#4CAF50]">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#4CAF50]">About</a></li>
                <li><a href="#" className="hover:text-[#4CAF50]">Contact</a></li>
                <li><a href="#" className="hover:text-[#4CAF50]">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#4CAF50]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#4CAF50]">Terms</a></li>
                <li><a href="#" className="hover:text-[#4CAF50]">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 FOOPTRA - Building Eco-Conscious Eating Habits. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
