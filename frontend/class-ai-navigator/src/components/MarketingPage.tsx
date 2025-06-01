import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  Star,
  CheckCircle, 
  TrendingUp, 
  BookOpen, 
  Award,
  Smartphone,
  Cloud,
  Heart,
  Target,
  Menu,
  X,
  ArrowRight,
  Zap,
  Globe,
  Brain,
  Sparkles,
  Lightbulb
} from 'lucide-react';

interface MarketingPageProps {
  onGetStarted?: () => void;
}

const MarketingPage = ({ onGetStarted }: MarketingPageProps) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'Features', id: 'features' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'Solutions', id: 'solutions' },
    { name: 'Resources', id: 'resources' },
    { name: 'Contact', id: 'contact' }
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Student Management',
      description: 'Revolutionary AI algorithms analyze student data to provide personalized insights and recommendations.',
      benefits: ['AI-generated student portfolios', 'Predictive academic performance', 'Intelligent parent communication']
    },
    {
      icon: BarChart3,
      title: 'Advanced AI Analytics',
      description: 'Machine learning algorithms provide deep insights and predictive analytics for performance optimization.',
      benefits: ['Real-time AI performance metrics', 'Predictive dropout prevention', 'Automated custom reporting']
    },
    {
      icon: BookOpen,
      title: 'Smart Grade Management',
      description: 'AI-enhanced grading system with intelligent assessment templates and automated feedback.',
      benefits: ['AI-assisted grading', 'Automated progress tracking', 'Intelligent performance insights']
    },
    {
      icon: Clock,
      title: 'AI Attendance Tracking',
      description: 'Smart attendance management with facial recognition and automated pattern analysis.',
      benefits: ['Facial recognition attendance', 'Pattern analysis alerts', 'Predictive attendance modeling']
    },
    {
      icon: Award,
      title: 'AI-Generated Report Cards',
      description: 'Intelligent report card generation with personalized comments and performance insights.',
      benefits: ['AI-written personalized comments', 'Dynamic template selection', 'Performance trend analysis']
    },
    {
      icon: Shield,
      title: 'AI-Secured & Intelligent',
      description: 'AI-powered security with intelligent threat detection and automated data protection.',
      benefits: ['AI threat detection', 'Intelligent backup scheduling', 'Smart compliance monitoring']
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small schools and individual teachers',
      features: [
        'Up to 100 students',
        'Basic reporting',
        'Email support',
        '5 report templates',
        'Mobile app access',
        'Basic analytics'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Ideal for medium-sized schools and institutions',
      features: [
        'Up to 500 students',
        'Advanced analytics',
        'Priority support',
        'All report templates',
        'Custom branding',
        'API access',
        'Bulk operations',
        'Parent portal'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For large institutions and school districts',
      features: [
        'Unlimited students',
        'AI-powered insights',
        '24/7 phone support',
        'Custom templates',
        'White-label solution',
        'Advanced integrations',
        'Dedicated account manager',
        'Custom training'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const solutions = [
    {
      icon: GraduationCap,
      title: 'K-12 Schools',
      description: 'Complete school management for primary and secondary education.',
      features: ['Multi-grade support', 'Parent engagement', 'Curriculum tracking']
    },
    {
      icon: Users,
      title: 'Universities',
      description: 'Advanced features for higher education institutions.',
      features: ['Course management', 'Research tracking', 'Alumni network']
    },
    {
      icon: Globe,
      title: 'International Schools',
      description: 'Multi-language support and global compliance.',
      features: ['Multi-currency', 'Global standards', 'Cultural adaptability']
    },
    {
      icon: Heart,
      title: 'Special Education',
      description: 'Specialized tools for inclusive education.',
      features: ['IEP tracking', 'Accessibility features', 'Therapy scheduling']
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Students Managed' },
    { number: '500+', label: 'Schools Using' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  const renderHomePage = () => (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-16">
        <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          🤖 AI-Powered Education Revolution
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
          The World's First
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block">
            AI-Powered School Management
          </span>
          <span className="block">Platform</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
          Transform your educational institution with cutting-edge artificial intelligence. 
          Experience unprecedented insights, automation, and efficiency that's revolutionizing education worldwide.
        </p>
        
        {/* AI Features Highlight */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl max-w-4xl mx-auto my-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <Sparkles className="h-8 w-8 text-purple-600" />
            <Lightbulb className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Revolutionary AI Features for Schools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">AI Student Insights</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Predict student performance, identify at-risk students, and personalize learning paths with advanced machine learning.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">Intelligent Automation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automate report generation, attendance tracking, and parent communications with smart AI algorithms.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-600">Smart Analytics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get real-time insights, predictive analytics, and data-driven recommendations to optimize your school's performance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
            onClick={onGetStarted}
          >
            Experience AI Magic
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-3">
            Watch AI Demo
          </Button>
        </div>
      </div>

      {/* Why Schools Choose Us */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-8 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Schools Choose EduManage AI
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Unlike traditional school management systems, we're powered by cutting-edge AI technology
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">AI-First Design</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built from the ground up with artificial intelligence at its core
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-bold mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-optimized performance that's 10x faster than traditional systems
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold mb-2">Predictive Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Predict and prevent issues before they happen with smart analytics
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="font-bold mb-2">Magical Experience</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intuitive AI interface that feels like magic, not complicated software
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {stat.number}
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Features Preview */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Features That Will Amaze You
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the future of education management with features you've never seen before.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.slice(0, 3).map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <Sparkles className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderFeaturesPage = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Complete AI-Powered Feature Set
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Discover all the revolutionary AI tools and features that make EduManage AI the leading choice for educational institutions worldwide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderPricingPage = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Choose the perfect plan for your educational institution. All plans include a 30-day free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {plan.price}
                <span className="text-lg text-gray-600 dark:text-gray-400">{plan.period}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={onGetStarted}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Need a custom solution? We offer enterprise packages tailored to your specific needs.
        </p>
        <Button variant="outline" size="lg">
          Contact Enterprise Sales
        </Button>
      </div>
    </div>
  );

  const renderSolutionsPage = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Solutions for Every Institution
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Our platform adapts to serve different types of educational institutions and their unique needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {solutions.map((solution, index) => {
          const IconComponent = solution.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <IconComponent className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{solution.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {solution.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderResourcesPage = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Resources & Support
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Get the most out of EduManage AI with our comprehensive resources and support materials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <CardTitle>Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comprehensive guides and tutorials to help you get started.
            </p>
            <Button variant="outline">Browse Docs</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <CardTitle>Community Forum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect with other educators and share best practices.
            </p>
            <Button variant="outline">Join Community</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <CardTitle>Training Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Step-by-step video tutorials for all features.
            </p>
            <Button variant="outline">Watch Videos</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContactPage = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Get in Touch
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Have questions? We're here to help. Reach out to our team for support or sales inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Sales Team</p>
                <p className="text-gray-600 dark:text-gray-400">sales@edumanage.ai</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">Support Team</p>
                <p className="text-gray-600 dark:text-gray-400">support@edumanage.ai</p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input className="w-full p-2 border rounded-md" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input className="w-full p-2 border rounded-md" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea className="w-full p-2 border rounded-md h-24" placeholder="Your message"></textarea>
            </div>
            <Button className="w-full">Send Message</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home': return renderHomePage();
      case 'features': return renderFeaturesPage();
      case 'pricing': return renderPricingPage();
      case 'solutions': return renderSolutionsPage();
      case 'resources': return renderResourcesPage();
      case 'contact': return renderContactPage();
      default: return renderHomePage();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">EduManage AI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" onClick={onGetStarted}>
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={onGetStarted}>
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="px-3 py-2 space-y-2">
                <Button variant="outline" className="w-full" onClick={onGetStarted}>
                  Sign In
                </Button>
                <Button className="w-full" onClick={onGetStarted}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">EduManage AI</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Transforming education with cutting-edge AI technology and intelligent solutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button onClick={() => setCurrentPage('features')}>Features</button></li>
                <li><button onClick={() => setCurrentPage('pricing')}>Pricing</button></li>
                <li><button onClick={() => setCurrentPage('solutions')}>Solutions</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button onClick={() => setCurrentPage('resources')}>Documentation</button></li>
                <li><button onClick={() => setCurrentPage('contact')}>Contact</button></li>
                <li><button onClick={() => setCurrentPage('resources')}>Community</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button onClick={() => setCurrentPage('home')}>About</button></li>
                <li><button onClick={() => setCurrentPage('contact')}>Careers</button></li>
                <li><button onClick={() => setCurrentPage('contact')}>Press</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 EduManage AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingPage;
