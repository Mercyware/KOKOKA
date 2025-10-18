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
  BookOpen,
  Award,
  Heart,
  Menu,
  X,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAppURL } from './config/env';

const MarketingPage = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Redirect to the main application login page
    window.location.href = getAppURL('/login');
  };

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'Features', id: 'features' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'Solutions', id: 'solutions' },
    { name: 'Contact', id: 'contact' }
  ];

  const features = [
    {
      icon: Users,
      title: 'Student Management',
      description: 'Comprehensive student information system with enrollment, demographics, and academic records.',
      benefits: ['Student profiles & portfolios', 'Enrollment management', 'Parent communication hub']
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Powerful reporting and analytics tools to track performance and make data-driven decisions.',
      benefits: ['Real-time performance metrics', 'Custom reports', 'Trend analysis']
    },
    {
      icon: BookOpen,
      title: 'Grade Management',
      description: 'Streamlined grading system with multiple assessment types and automated calculations.',
      benefits: ['Flexible grading scales', 'Progress tracking', 'Report card generation']
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Efficient attendance management with multiple marking options and automated reports.',
      benefits: ['Quick attendance entry', 'Absence notifications', 'Attendance analytics']
    },
    {
      icon: Award,
      title: 'Academic Management',
      description: 'Complete academic year, term, and class management with subject assignments.',
      benefits: ['Academic calendars', 'Class scheduling', 'Subject management']
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control and data encryption.',
      benefits: ['Data encryption', 'Regular backups', 'GDPR compliant']
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small schools',
      features: [
        'Up to 100 students',
        'Basic reporting',
        'Email support',
        '5 report templates',
        'Mobile access'
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Ideal for medium schools',
      features: [
        'Up to 500 students',
        'Advanced analytics',
        'Priority support',
        'All report templates',
        'Custom branding',
        'API access',
        'Parent portal'
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For large institutions',
      features: [
        'Unlimited students',
        'Custom features',
        '24/7 support',
        'White-label solution',
        'Advanced integrations',
        'Dedicated support',
        'Custom training'
      ],
      popular: false,
    }
  ];

  const solutions = [
    {
      icon: GraduationCap,
      title: 'K-12 Schools',
      description: 'Complete management for primary and secondary education.',
      features: ['Multi-grade support', 'Parent engagement', 'Curriculum tracking']
    },
    {
      icon: Users,
      title: 'Universities',
      description: 'Advanced features for higher education.',
      features: ['Course management', 'Research tracking', 'Alumni network']
    },
    {
      icon: Globe,
      title: 'International Schools',
      description: 'Multi-language support and global compliance.',
      features: ['Multi-currency', 'Global standards', 'Multi-language']
    },
    {
      icon: Heart,
      title: 'Special Education',
      description: 'Specialized tools for inclusive education.',
      features: ['IEP tracking', 'Accessibility', 'Therapy scheduling']
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Students Managed' },
    { number: '500+', label: 'Schools Worldwide' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support Available' }
  ];

  const renderHomePage = () => (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12 md:py-20">
        <Badge className="mb-4 bg-primary text-white border-primary-600">
          Trusted by Schools Worldwide
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
          Modern School Management
          <span className="text-primary block mt-2">
            Made Simple
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Streamline your educational institution with our comprehensive school management system.
          Everything you need in one powerful platform.
        </p>


        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-700 text-white text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={handleGetStarted}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6 h-auto rounded-xl border-2 border-primary text-primary hover:bg-primary-50"
          >
            Schedule Demo
          </Button>
        </div>
      </div>


      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-gray-200 dark:border-gray-700">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">
              {stat.number}
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Features Preview */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to simplify school administration and enhance learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.slice(0, 3).map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary-50 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
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
          Complete Feature Set
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Discover all the tools and features that make KOKOKA the leading choice for schools worldwide.
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
              <div className="text-4xl font-bold text-primary mt-4">
                {plan.price}
                <span className="text-lg text-gray-600 dark:text-gray-400">{plan.period}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary-700 text-white' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={handleGetStarted}
              >
                Get Started
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
              <div className="p-2 bg-primary-50 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Sales Team</p>
                <p className="text-gray-600 dark:text-gray-400">sales@kokoka.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Support Team</p>
                <p className="text-gray-600 dark:text-gray-400">support@kokoka.com</p>
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
            <Button className="w-full bg-primary hover:bg-primary-700 text-white">Send Message</Button>
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
      case 'contact': return renderContactPage();
      default: return renderHomePage();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg shadow-md">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">KOKOKA</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`text-sm font-medium transition-colors ${currentPage === item.id
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
              <Button variant="outline" onClick={() => window.location.href = getAppURL('/login')}>
                Sign In
              </Button>
              <Button className="bg-primary hover:bg-primary-700 text-white" onClick={handleGetStarted}>
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
                  className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors ${currentPage === item.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="px-3 py-2 space-y-2">
                <Button variant="outline" className="w-full" onClick={handleGetStarted}>
                  Sign In
                </Button>
                <Button className="w-full" onClick={handleGetStarted}>
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
                <div className="p-2 bg-primary rounded-lg shadow-md">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">KOKOKA</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Modern school management made simple. Trusted by institutions worldwide.
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
            <p>&copy; 2024 KOKOKA School Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingPage;
