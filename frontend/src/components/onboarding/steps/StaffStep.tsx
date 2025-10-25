import React from 'react';
import { UserPlus, Plus } from 'lucide-react';
import { StepComponentProps } from '../OnboardingWizard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const StaffStep: React.FC<StepComponentProps> = ({ onNext, onSkip, onComplete }) => {
  const navigate = useNavigate();

  const handleGoToStaff = () => {
    // Mark step as completed and navigate to staff page
    onComplete?.({ action: 'navigate_to_staff' });
    navigate('/staff/create');
  };

  const handleSkipStep = () => {
    onSkip?.();
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-900/30 mb-4">
          <UserPlus className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Add Staff Members
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Invite teachers and administrative staff to your school
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">You can add:</h4>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-600"></div>
            <span>Teachers</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-600"></div>
            <span>Administrative Staff</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-600"></div>
            <span>Librarians</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-600"></div>
            <span>Support Staff</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          intent="primary"
          onClick={handleGoToStaff}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Staff Members
        </Button>
        <Button
          variant="ghost"
          onClick={handleSkipStep}
          className="w-full !text-slate-700 dark:!text-slate-200 !bg-transparent hover:!bg-slate-100 dark:hover:!bg-slate-700 !border-0"
        >
          Skip this step
        </Button>
      </div>
    </div>
  );
};

export default StaffStep;
