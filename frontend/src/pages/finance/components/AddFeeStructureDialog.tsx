import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { createFeeStructure } from '@/services/financeService';
import { getAllClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { useToast } from '@/hooks/use-toast';

interface Class {
  id: string;
  name: string;
  grade?: string;
}

interface AcademicYear {
  id: string;
  name: string;
}

interface AddFeeStructureDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddFeeStructureDialog: React.FC<AddFeeStructureDialogProps> = ({
  open,
  onClose,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: 'MONTHLY',
    gradeLevel: '',
    category: '',
    academicYearId: '',
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      loadClasses();
      loadAcademicYears();
    }
  }, [open]);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await getAllClasses();
      // Handle API response format { success: boolean, data: Class[] }
      if (response?.success && response.data) {
        setClasses(Array.isArray(response.data) ? response.data : []);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadAcademicYears = async () => {
    try {
      const response = await getAllAcademicYears();
      if (response?.success && response.data?.academicYears) {
        setAcademicYears(response.data.academicYears);
        // Set first academic year as default
        if (response.data.academicYears.length > 0 && !formData.academicYearId) {
          setFormData(prev => ({ ...prev, academicYearId: response.data.academicYears[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading academic years:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.academicYearId) {
      toast({
        title: 'Error',
        description: 'Name, amount, and academic year are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await createFeeStructure({
        name: formData.name,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency as any,
        gradeLevel: formData.gradeLevel || undefined,
        category: formData.category || undefined,
        academicYearId: formData.academicYearId,
        isActive: formData.isActive,
      });

      toast({
        title: 'Success',
        description: 'Fee structure created successfully',
      });

      onClose();
    } catch (error: any) {
      console.error('Error creating fee structure:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create fee structure',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Fee Structure</DialogTitle>
          <DialogDescription>
            Create a new fee structure for your school
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tuition Fee, Transport Fee"
                required
              />
            </div>

            {/* Academic Year */}
            <div>
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Select
                value={formData.academicYearId}
                onValueChange={(value) => setFormData({ ...formData, academicYearId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || 'other'}
                onValueChange={(value) => setFormData({ ...formData, category: value === 'other' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Facilities">Facilities</SelectItem>
                  <SelectItem value="Activities">Activities</SelectItem>
                  <SelectItem value="Boarding">Boarding</SelectItem>
                  <SelectItem value="Meals">Meals</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount and Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="TERMINAL">Per Term</SelectItem>
                    <SelectItem value="SEMESTERLY">Semesterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                    <SelectItem value="ONE_TIME">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grade Level / Class */}
            <div>
              <Label htmlFor="gradeLevel">Class (Optional)</Label>
              <Select
                value={formData.gradeLevel || 'all'}
                onValueChange={(value) => setFormData({ ...formData, gradeLevel: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {loadingClasses ? (
                    <SelectItem value="loading" disabled>
                      Loading classes...
                    </SelectItem>
                  ) : (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Leave as "All Classes" to apply this fee to all classes
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this fee"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" intent="cancel" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" intent="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Fee Structure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFeeStructureDialog;
