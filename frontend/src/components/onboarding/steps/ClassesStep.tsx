import React from 'react';
import { Users, Plus, ArrowRight } from 'lucide-react';
import { StepComponentProps } from '../OnboardingWizard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ClassesStep: React.FC<StepComponentProps> = ({ onNext, onSkip, onComplete }) => {
  const navigate = useNavigate();

  const handleGoToClasses = () => {
    // Mark step as completed and navigate to classes page
    onComplete?.({ action: 'navigate_to_classes' });
    navigate('/school-settings/classes');
  };

  const handleSkipStep = () => {
    onSkip?.();
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-950 mb-4">
          <Users className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Set Up Your Classes
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Create classes and sections to organize your students
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">What you'll need:</h4>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-cyan-600 dark:text-cyan-400">1</span>
            </div>
            <span>Class names (e.g., Grade 1, Year 7, Form 1)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-cyan-600 dark:text-cyan-400">2</span>
            </div>
            <span>Sections if you have multiple divisions (e.g., A, B, C)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-cyan-600 dark:text-cyan-400">3</span>
            </div>
            <span>Student capacity for each class/section</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          intent="primary"
          onClick={handleGoToClasses}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Classes Now
        </Button>
        <Button
          variant="ghost"
          onClick={handleSkipStep}
          className="w-full !text-slate-700 dark:!text-slate-200 !bg-transparent hover:!bg-slate-100 dark:hover:!bg-slate-700 !border-0"
        >
          I'll do this later
        </Button>
      </div>

      <p className="text-xs text-center text-slate-500 dark:text-slate-400">
        You can always add more classes later in School Settings → Classes
      </p>
    </div>
  );
};

export default ClassesStep;
