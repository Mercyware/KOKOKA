import React from 'react';
import { Users, Plus, Upload } from 'lucide-react';
import { StepComponentProps } from '../OnboardingWizard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const StudentsStep: React.FC<StepComponentProps> = ({ onNext, onSkip, onComplete }) => {
  const navigate = useNavigate();

  const handleGoToStudents = () => {
    // Mark step as completed and navigate to students page
    onComplete?.({ action: 'navigate_to_students' });
    navigate('/students/add');
  };

  const handleSkipStep = () => {
    onSkip?.();
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
          <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Enroll Students
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start adding students to your school
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Two ways to add students:</h4>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Plus className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Add Individually</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter student details one by one
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Upload className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Bulk Import</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a CSV file with multiple students (coming soon)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          intent="primary"
          onClick={handleGoToStudents}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Students
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

export default StudentsStep;
