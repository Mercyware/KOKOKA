import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, ArrowRight, ArrowLeft, Rocket } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as authService from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

// Import step components
import WelcomeStep from './steps/WelcomeStep';
import AcademicYearStep from './steps/AcademicYearStep';
import ClassesStep from './steps/ClassesStep';
import SubjectsStep from './steps/SubjectsStep';
import StaffStep from './steps/StaffStep';
import StudentsStep from './steps/StudentsStep';
import CompletionStep from './steps/CompletionStep';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepComponentProps>;
  required: boolean;
  roles: string[]; // Which roles need this step
}

export interface StepComponentProps {
  onNext: () => void;
  onSkip?: () => void;
  onComplete?: (data: any) => void;
}

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ open, onClose }) => {
  const { authState, checkAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Debug state changes only when relevant values change
  React.useEffect(() => {
    console.log('🔍 OnboardingWizard State Changed:', {
      open,
      currentStep,
      completedSteps: Array.from(completedSteps),
      stepDataKeys: Object.keys(stepData),
      isSubmitting,
      isLoading,
      userRole: authState.user?.role
    });
  }, [open, currentStep, completedSteps, stepData, isSubmitting, isLoading, authState.user?.role]);

  // Define all possible steps
  const allSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Get started with KOKOKA',
      component: WelcomeStep,
      required: true,
      roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
      id: 'academic-year',
      title: 'Academic Year',
      description: 'Set up your academic year',
      component: AcademicYearStep,
      required: true,
      roles: ['admin'],
    },
    {
      id: 'classes',
      title: 'Classes & Sections',
      description: 'Create your classes',
      component: ClassesStep,
      required: true,
      roles: ['admin'],
    },
    {
      id: 'subjects',
      title: 'Subjects',
      description: 'Add subjects to teach',
      component: SubjectsStep,
      required: true,
      roles: ['admin'],
    },
    {
      id: 'staff',
      title: 'Staff Members',
      description: 'Add teachers and staff',
      component: StaffStep,
      required: false,
      roles: ['admin'],
    },
    {
      id: 'students',
      title: 'Students',
      description: 'Enroll your first students',
      component: StudentsStep,
      required: false,
      roles: ['admin'],
    },
    {
      id: 'completion',
      title: 'All Set!',
      description: 'Start using KOKOKA',
      component: CompletionStep,
      required: true,
      roles: ['admin', 'teacher', 'student', 'parent'],
    },
  ];

  // Filter steps based on user role
  const steps = React.useMemo(() => {
    const filtered = allSteps.filter(step =>
      step.roles.includes(authState.user?.role.toLowerCase() || 'student')
    );
    console.log('📋 Filtered Steps:', filtered.map(s => ({ id: s.id, title: s.title, required: s.required })));
    console.log('👤 User Role:', authState.user?.role?.toLowerCase() || 'student');
    return filtered;
  }, [authState.user?.role]);

  // Load saved onboarding progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!open || !authState.user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get user's onboarding progress from authState
        const savedStep = authState.user.onboardingStep || 0;
        const savedData = authState.user.onboardingData || {};

        console.log('📂 Loading onboarding progress:', { savedStep, savedData, stepsLength: steps.length });

        // Find the step index to resume from
        if (savedStep > 0 && savedStep < steps.length) {
          setCurrentStep(savedStep);
          setStepData(savedData);

          // Mark all previous steps as completed
          const completed = new Set<string>();
          for (let i = 0; i < savedStep; i++) {
            completed.add(steps[i].id);
          }
          setCompletedSteps(completed);
          console.log('✅ Restored progress to step:', savedStep, 'Completed steps:', Array.from(completed));
        }
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [open, authState.user?.id, steps.length]); // More specific dependencies

  // Calculate progress
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    console.log('➡️ handleNext called:', {
      currentStep,
      stepsLength: steps.length,
      canAdvance: currentStep < steps.length - 1,
      currentStepId: steps[currentStep]?.id
    });
    
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => {
        const newCompleted = new Set([...prev, steps[currentStep].id]);
        console.log('✅ Marking step as completed:', steps[currentStep].id, 'All completed:', Array.from(newCompleted));
        return newCompleted;
      });
      setCurrentStep(prev => {
        const newStep = prev + 1;
        console.log('📈 Advancing to step:', newStep, 'Step info:', steps[newStep]);
        return newStep;
      });
    } else {
      console.log('🚫 Cannot advance - already at last step');
    }
  };

  const handleBack = () => {
    console.log('⬅️ handleBack called:', {
      currentStep,
      canGoBack: currentStep > 0,
      targetStep: currentStep - 1
    });
    
    if (currentStep > 0) {
      setCurrentStep(prev => {
        const newStep = prev - 1;
        console.log('📉 Going back to step:', newStep, 'Step info:', steps[newStep]);
        return newStep;
      });
    } else {
      console.log('🚫 Cannot go back - already at first step');
    }
  };

  const handleSkip = () => {
    console.log('⏭️ handleSkip called:', {
      currentStep,
      stepId: steps[currentStep]?.id,
      isRequired: steps[currentStep]?.required,
      canSkip: !steps[currentStep]?.required
    });
    
    if (!steps[currentStep].required) {
      console.log('✅ Skipping step:', steps[currentStep].id);
      handleNext();
    } else {
      console.log('🚫 Cannot skip - step is required');
    }
  };

  const handleStepComplete = async (data: any) => {
    console.log('🎯 handleStepComplete called:', {
      currentStep,
      stepId: steps[currentStep]?.id,
      data,
      existingStepData: stepData
    });
    
    const updatedData = { ...stepData, [steps[currentStep].id]: data };
    setStepData(updatedData);
    
    // Mark step as completed
    setCompletedSteps(prev => {
      const newCompleted = new Set([...prev, steps[currentStep].id]);
      console.log('✅ Step completed via onComplete:', steps[currentStep].id, 'All completed:', Array.from(newCompleted));
      return newCompleted;
    });

    // Save progress when a step is actually completed
    try {
      console.log('💾 Saving progress to backend...');
      await authService.updateOnboardingProgress(
        currentStep + 1,
        false,
        updatedData
      );
      console.log('✅ Progress saved successfully');
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }

    handleNext();
  };

  const handleFinish = async () => {
    // Save onboarding completion to backend
    setIsSubmitting(true);
    try {
      const response = await authService.updateOnboardingProgress(
        steps.length, // final step number
        true, // completed
        stepData // all collected data
      );

      if (response.success) {
        // Refresh user data to get updated onboarding status
        await checkAuth();

        toast({
          title: 'Welcome to KOKOKA!',
          description: 'Your onboarding is complete. Let\'s get started!',
          variant: 'default',
        });

        onClose();
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Failed to complete onboarding');
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep]?.component;
  const currentStepInfo = steps[currentStep];

  // Debug current step only when it changes
  React.useEffect(() => {
    console.log('🎭 Current Step Component Info:', {
      currentStep,
      stepInfo: currentStepInfo ? {
        id: currentStepInfo.id,
        title: currentStepInfo.title,
        required: currentStepInfo.required
      } : null,
      hasComponent: !!CurrentStepComponent,
      componentName: CurrentStepComponent?.name,
      completedSteps: Array.from(completedSteps),
      totalSteps: steps.length,
      isLastStep: currentStep === steps.length - 1
    });
  }, [currentStep, currentStepInfo, CurrentStepComponent, completedSteps, steps.length]);

  // Show loading state while loading progress
  if (isLoading) {
    return (
      <Dialog open={open}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading your progress...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-6xl w-[95vw] h-[88vh] flex flex-col p-0 gap-0 overflow-hidden [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="bg-cyan-600 dark:bg-cyan-700 px-6 py-3 text-white flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">Welcome to KOKOKA!</h1>
                <p className="text-white/80 text-xs">Set up your school in {steps.length} simple steps</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-medium text-white/80">
                Step {currentStep + 1} of {steps.length}
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 h-6 w-6 p-0 rounded transition-colors flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content Area - Uses remaining flex space */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 min-h-0">
          <div className="h-full p-6">
            <div className="max-w-5xl mx-auto h-full flex items-center justify-center">
              {/* Step Content */}
              {CurrentStepComponent && (
                <div className="w-full">
                  <CurrentStepComponent
                    onNext={handleNext}
                    onSkip={!currentStepInfo?.required ? handleSkip : undefined}
                    onComplete={handleStepComplete}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-2.5 bg-white dark:bg-slate-800 flex items-center justify-between flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              console.log('🔙 Back button clicked');
              handleBack();
            }}
            disabled={currentStep === 0}
            className="gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {!currentStepInfo?.required && currentStep < steps.length - 1 && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  console.log('⏭️ Skip button clicked');
                  handleSkip();
                }} 
                className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Skip for now
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button 
                intent="primary" 
                onClick={() => {
                  console.log('▶️ Continue button clicked - Current step:', currentStep);
                  handleNext();
                }} 
                className="gap-2"
                disabled={steps[currentStep]?.required && !completedSteps.has(steps[currentStep]?.id) && currentStep !== 0}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                intent="primary"
                onClick={() => {
                  console.log('🚀 Finish button clicked');
                  handleFinish();
                }}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? 'Completing...' : 'Get Started'}
                <Rocket className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
