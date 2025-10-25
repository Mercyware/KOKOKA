import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { StepComponentProps } from '../OnboardingWizard';
import { useAuth } from '@/contexts/AuthContext';

const CompletionStep: React.FC<StepComponentProps> = ({ onNext }) => {
  const { authState } = useAuth();

  const nextSteps = [
    {
      title: 'Complete your profile',
      description: 'Add your photo and contact information',
      link: '/profile',
    },
    {
      title: 'Explore the dashboard',
      description: 'Get an overview of your school activities',
      link: '/dashboard',
    },
    {
      title: 'Configure settings',
      description: 'Customize KOKOKA to match your school needs',
      link: '/settings',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          All Set, {authState.user?.name}!
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Your school management system is ready to use
        </p>
      </div>

      <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-950/30 dark:to-emerald-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              What's next?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Here are some recommended next steps to get the most out of KOKOKA:
            </p>
            <ul className="space-y-3">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {step.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
          Need help getting started?
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Check out our documentation, video tutorials, or contact our support team for
          personalized assistance.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="#"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Documentation
          </a>
          <span className="text-slate-400">•</span>
          <a
            href="#"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Video Tutorials
          </a>
          <span className="text-slate-400">•</span>
          <a
            href="#"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Contact Support
          </a>
        </div>
      </div>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        <p>🎉 Welcome to the KOKOKA family!</p>
      </div>
    </div>
  );
};

export default CompletionStep;
