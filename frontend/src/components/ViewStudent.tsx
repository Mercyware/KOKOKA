import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, UserCircle, BookOpen, Calendar, Award, BarChart2 } from 'lucide-react';

interface ViewStudentProps {
  studentId: number;
  onBack: () => void;
  onEdit: () => void;
}

const ViewStudent: React.FC<ViewStudentProps> = ({ studentId, onBack, onEdit }) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch student data from API
    // For demo, we'll use mock data
    const mockStudent = {
      id: studentId,
      name: 'John Doe',
      grade: '10',
      section: 'A',
      rollNumber: '2023-10-042',
      gender: 'Male',
      dateOfBirth: '2008-05-15',
      address: '123 School Lane, Education City',
      contactNumber: '+1 (555) 123-4567',
      email: 'john.doe@example.com',
      parentName: 'Jane Doe',
      parentContact: '+1 (555) 987-6543',
      admissionDate: '2020-09-01',
      bloodGroup: 'O+',
      medicalConditions: 'None',
      subjects: [
        { name: 'Mathematics', teacher: 'Dr. Smith', grade: 'A', attendance: '95%' },
        { name: 'Science', teacher: 'Mrs. Johnson', grade: 'B+', attendance: '92%' },
        { name: 'English', teacher: 'Mr. Williams', grade: 'A-', attendance: '98%' },
        { name: 'History', teacher: 'Ms. Brown', grade: 'B', attendance: '90%' },
        { name: 'Physical Education', teacher: 'Mr. Davis', grade: 'A', attendance: '100%' },
      ],
      attendance: {
        present: 85,
        absent: 5,
        late: 3,
        excused: 2,
        percentage: '89.5%'
      },
      fees: {
        total: '$5,000',
        paid: '$3,500',
        due: '$1,500',
        dueDate: '2023-12-15',
        status: 'Partially Paid'
      },
      achievements: [
        { title: 'Science Fair Winner', date: '2023-04-15', description: 'First place in regional science fair' },
        { title: 'Math Olympiad', date: '2023-02-10', description: 'Bronze medal in national competition' },
        { title: 'Perfect Attendance', date: '2022-12-20', description: 'Fall semester perfect attendance award' },
      ]
    };

    setTimeout(() => {
      setStudent(mockStudent);
      setLoading(false);
    }, 500);
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The student you're looking for doesn't exist or has been removed.</p>
        <Button onClick={onBack}>Back to Students</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Student Profile</h2>
        </div>
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Student
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-6">
        {/* Student Info Card */}
        <Card className="md:col-span-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UserCircle className="h-24 w-24 text-muted-foreground" />
            </div>
            <CardTitle>{student.name}</CardTitle>
            <CardDescription>
              Grade {student.grade} | Section {student.section} | Roll #{student.rollNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p>{student.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p>{student.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                  <p>{student.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admission Date</p>
                  <p>{student.admissionDate}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
                <p className="text-sm">{student.email}</p>
                <p className="text-sm">{student.contactNumber}</p>
                <p className="text-sm">{student.address}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Parent/Guardian</p>
                <p className="text-sm">{student.parentName}</p>
                <p className="text-sm">{student.parentContact}</p>
              </div>
              
              {student.medicalConditions !== 'None' && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medical Conditions</p>
                  <p className="text-sm">{student.medicalConditions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <div className="md:col-span-4">
          <Tabs defaultValue="academics">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="academics">
                <BookOpen className="mr-2 h-4 w-4" />
                Academics
              </TabsTrigger>
              <TabsTrigger value="attendance">
                <Calendar className="mr-2 h-4 w-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="fees">
                <BarChart2 className="mr-2 h-4 w-4" />
                Fees
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Award className="mr-2 h-4 w-4" />
                Achievements
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="academics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Subjects</CardTitle>
                  <CardDescription>
                    Academic performance across enrolled subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.subjects.map((subject: any, index: number) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-muted-foreground">Teacher: {subject.teacher}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Grade: {subject.grade}</p>
                          <p className="text-sm text-muted-foreground">Attendance: {subject.attendance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                  <CardDescription>
                    Current academic year attendance record
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Present</p>
                      <p className="text-2xl font-bold">{student.attendance.present} days</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Absent</p>
                      <p className="text-2xl font-bold">{student.attendance.absent} days</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Late</p>
                      <p className="text-2xl font-bold">{student.attendance.late} days</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Excused</p>
                      <p className="text-2xl font-bold">{student.attendance.excused} days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <p className="font-medium">Overall Attendance</p>
                    <p className="text-xl font-bold">{student.attendance.percentage}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="fees" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Status</CardTitle>
                  <CardDescription>
                    Current academic year fee details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Fees</p>
                        <p className="text-xl font-bold">{student.fees.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Paid Amount</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{student.fees.paid}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Amount</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">{student.fees.due}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="text-xl font-bold">{student.fees.dueDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <p className="font-medium">Payment Status</p>
                      <p className={`font-bold ${
                        student.fees.status === 'Paid' 
                          ? 'text-green-600 dark:text-green-400' 
                          : student.fees.status === 'Unpaid' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {student.fees.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Payment History</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Achievements</CardTitle>
                  <CardDescription>
                    Awards, certificates and recognitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.achievements.map((achievement: any, index: number) => (
                      <div key={index} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <span className="text-sm text-muted-foreground">{achievement.date}</span>
                        </div>
                        <p className="text-sm">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Add Achievement</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ViewStudent;
