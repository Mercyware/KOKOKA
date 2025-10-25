import React from 'react';
import { Sparkles, GraduationCap, Users, BookOpen, Calendar, BarChart } from 'lucide-react';
import { StepComponentProps } from '../OnboardingWizard';
import { useAuth } from '@/contexts/AuthContext';

const WelcomeStep: React.FC<StepComponentProps> = ({ onNext, onSkip, onComplete }) => {
  const { authState } = useAuth();

  console.log('👋 WelcomeStep rendered with props:', { 
    hasOnNext: !!onNext, 
    hasOnSkip: !!onSkip, 
    hasOnComplete: !!onComplete,
    userName: authState.user?.name 
  });

  // Auto-advance to next step when component mounts - REMOVED for debugging
  React.useEffect(() => {
    console.log('🔄 WelcomeStep useEffect triggered');
    // Small delay to let user read the welcome message
    const timer = setTimeout(() => {
      console.log('⏰ WelcomeStep timer fired - but not auto-advancing for debugging');
      // Welcome step is informational only, auto-advance
      // Commented out for debugging: onNext?.();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: 'Academic Management',
      description: 'Manage academic years, terms, and calendars effortlessly',
    },
    {
      icon: Users,
      title: 'Student & Staff Management',
      description: 'Keep track of students, teachers, and staff members',
    },
    {
      icon: BookOpen,
      title: 'Classes & Subjects',
      description: 'Organize classes, subjects, and learning materials',
    },
    {
      icon: BarChart,
      title: 'Performance Tracking',
      description: 'Monitor grades, attendance, and generate reports',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Message */}
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-cyan-600 mb-3">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Welcome, {authState.user?.name}!
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Let's get your school set up in just a few minutes
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 dark:hover:border-primary transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-0.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3">
        <div className="flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm text-cyan-900 dark:text-cyan-100 mb-0.5">
              Quick Setup Process
            </h4>
            <p className="text-xs text-cyan-800 dark:text-cyan-200">
              We'll guide you through setting up the essentials: academic year, classes, subjects,
              and more. You can always add or modify these later in the settings.
            </p>
          </div>
        </div>
      </div>

      {/* Estimated Time */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
        <p>⏱️ Estimated time: 5-10 minutes</p>
      </div>
    </div>
  );
};

export default WelcomeStep;
