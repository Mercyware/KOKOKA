import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, GraduationCap, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getAllClasses } from '../../services/classService';
import { Class } from '../../types';

interface ClassVisualizationProps {
  onClassEdit?: (classItem: Class) => void;
}

interface GradeGroup {
  grade: string;
  classes: Class[];
}

const ClassesVisualization: React.FC<ClassVisualizationProps> = ({ onClassEdit }) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [gradeGroups, setGradeGroups] = useState<GradeGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    organizeClassesByGrade();
  }, [classes]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await getAllClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        toast({
          title: "Error",
          description: 'Failed to load classes',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: 'An error occurred while loading classes',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeClassesByGrade = () => {
    if (classes.length === 0) {
      setGradeGroups([]);
      return;
    }

    // Group classes by grade
    const groupedClasses = classes.reduce((groups: { [key: string]: Class[] }, classItem) => {
      const grade = classItem.grade?.toString() || 'Unassigned';
      if (!groups[grade]) {
        groups[grade] = [];
      }
      groups[grade].push(classItem);
      return groups;
    }, {});

    // Convert to array and sort by grade
    const gradeGroupsArray: GradeGroup[] = Object.entries(groupedClasses)
      .map(([grade, classes]) => ({ grade, classes }))
      .sort((a, b) => {
        const aNum = parseInt(a.grade);
        const bNum = parseInt(b.grade);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }

        if (!isNaN(aNum) && isNaN(bNum)) return -1;
        if (isNaN(aNum) && !isNaN(bNum)) return 1;

        return a.grade.localeCompare(b.grade);
      });

    setGradeGroups(gradeGroupsArray);
  };

  const getGradeColor = (index: number) => {
    const colors = [
      'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
      'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800',
      'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
      'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800',
      'bg-pink-50 border-pink-200 dark:bg-pink-950/20 dark:border-pink-800',
      'bg-teal-50 border-teal-200 dark:bg-teal-950/20 dark:border-teal-800',
      'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800',
      'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800',
    ];
    return colors[index % colors.length];
  };

  const getTotalStudents = (gradeGroup: GradeGroup) => {
    return gradeGroup.classes.reduce((total, cls) => total + (cls.capacity || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading classes...</span>
      </div>
    );
  }

  if (gradeGroups.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No classes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create some classes to see the student progression path
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Header */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Student Progression Path
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This visualization shows how students progress through different grade levels in your school.
                Each grade contains one or more classes that students can be assigned to.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression Visualization */}
      <div className="relative">
        {/* Desktop: Horizontal Flow */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-start gap-4 overflow-x-auto pb-4 px-4">
            {gradeGroups.map((gradeGroup, index) => (
              <React.Fragment key={gradeGroup.grade}>
                {/* Grade Column */}
                <div className="flex flex-col items-center min-w-[280px] max-w-[280px]">
                  {/* Grade Header */}
                  <div className={`w-full rounded-lg border-2 p-4 mb-4 ${getGradeColor(index)}`}>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        Grade {gradeGroup.grade}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{gradeGroup.classes.length} class{gradeGroup.classes.length !== 1 ? 'es' : ''}</span>
                        {getTotalStudents(gradeGroup) > 0 && (
                          <>
                            <span>•</span>
                            <span>~{getTotalStudents(gradeGroup)} capacity</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Classes List */}
                  <div className="w-full space-y-2 flex-1">
                    {gradeGroup.classes.map((classItem) => (
                      <Card
                        key={classItem.id}
                        className="hover:shadow-md transition-shadow cursor-default"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {classItem.name}
                              </h4>
                              {classItem.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {classItem.description}
                                </p>
                              )}
                              {classItem.capacity && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  <Users className="h-3 w-3 mr-1" />
                                  Capacity: {classItem.capacity}
                                </Badge>
                              )}
                            </div>
                            {onClassEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 flex-shrink-0"
                                onClick={() => onClassEdit(classItem)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Arrow Between Grades */}
                {index < gradeGroups.length - 1 && (
                  <div className="flex items-center justify-center pt-12 flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <ArrowRight className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Progress
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: Vertical Flow */}
        <div className="lg:hidden space-y-4">
          {gradeGroups.map((gradeGroup, index) => (
            <React.Fragment key={gradeGroup.grade}>
              {/* Grade Section */}
              <div className="space-y-3">
                {/* Grade Header */}
                <div className={`rounded-lg border-2 p-4 ${getGradeColor(index)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Grade {gradeGroup.grade}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <Users className="h-4 w-4" />
                        <span>{gradeGroup.classes.length} class{gradeGroup.classes.length !== 1 ? 'es' : ''}</span>
                        {getTotalStudents(gradeGroup) > 0 && (
                          <>
                            <span>•</span>
                            <span>~{getTotalStudents(gradeGroup)} capacity</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classes List */}
                <div className="space-y-2 pl-4">
                  {gradeGroup.classes.map((classItem) => (
                    <Card
                      key={classItem.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {classItem.name}
                            </h4>
                            {classItem.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {classItem.description}
                              </p>
                            )}
                            {classItem.capacity && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Capacity: {classItem.capacity}
                              </Badge>
                            )}
                          </div>
                          {onClassEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 flex-shrink-0"
                              onClick={() => onClassEdit(classItem)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Down Arrow Between Grades */}
              {index < gradeGroups.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-0.5 bg-blue-300 dark:bg-blue-700"></div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <div className="h-0.5 w-4 bg-blue-300 dark:bg-blue-700"></div>
                      <span className="text-xs font-medium">Student Progress</span>
                      <div className="h-0.5 w-4 bg-blue-300 dark:bg-blue-700"></div>
                    </div>
                    <div className="h-8 w-0.5 bg-blue-300 dark:bg-blue-700"></div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {gradeGroups.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Grade Levels
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {classes.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Classes
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {gradeGroups.reduce((total, group) => total + getTotalStudents(group), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Capacity
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassesVisualization;
