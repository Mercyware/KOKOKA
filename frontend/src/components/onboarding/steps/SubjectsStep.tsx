import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { StepComponentProps } from '../OnboardingWizard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SubjectsStep: React.FC<StepComponentProps> = ({ onNext, onSkip, onComplete }) => {
  const navigate = useNavigate();

  const handleGoToSubjects = () => {
    // Mark step as completed and navigate to subjects page
    onComplete?.({ action: 'navigate_to_subjects' });
    navigate('/school-settings/subjects');
  };

  const handleSkipStep = () => {
    onSkip?.();
  };

  const commonSubjects = [
    'Mathematics', 'English', 'Science', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Literature', 'Physical Education'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 mb-4">
          <BookOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Add Your Subjects
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Define the subjects taught in your school
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Common subjects include:</h4>
        <div className="flex flex-wrap gap-2">
          {commonSubjects.map(subject => (
            <span
              key={subject}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              {subject}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
        <p className="text-sm text-cyan-800 dark:text-cyan-200">
          💡 <strong>Tip:</strong> You can assign subjects to specific classes and teachers after creating them.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          intent="primary"
          onClick={handleGoToSubjects}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Subjects Now
        </Button>
        <Button
          variant="ghost"
          onClick={handleSkipStep}
          className="w-full !text-slate-700 dark:!text-slate-200 !bg-transparent hover:!bg-slate-100 dark:hover:!bg-slate-700 !border-0"
        >
          I'll do this later
        </Button>
      </div>
    </div>
  );
};

export default SubjectsStep;
