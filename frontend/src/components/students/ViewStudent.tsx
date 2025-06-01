
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Calendar, GraduationCap, TrendingUp, Camera, Upload, Eye } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ViewStudentProps {
  studentId: number;
  onBack: () => void;
  onEdit: () => void;
}

const ViewStudent = ({ studentId, onBack, onEdit }: ViewStudentProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock student data - in real app, fetch by ID
  const student = {
    id: studentId,
    name: 'Emma Johnson',
    email: 'emma.j@school.edu',
    phone: '+1 234-567-8901',
    grade: '10th Grade',
    class: '10-A',
    status: 'Active',
    gpa: 3.8,
    attendance: 95,
    address: '123 Main St, City, State 12345',
    parentName: 'John Johnson',
    parentPhone: '+1 234-567-8900',
    enrollmentDate: '2023-09-01',
    emergencyContact: 'Jane Johnson (+1 234-567-8902)',
    profileImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face',
    recentGrades: [
      { subject: 'Mathematics', grade: 'A-', score: 92 },
      { subject: 'English', grade: 'B+', score: 88 },
      { subject: 'Science', grade: 'A', score: 95 },
      { subject: 'History', grade: 'A-', score: 91 }
    ],
    attendanceHistory: [
      { month: 'January', percentage: 98 },
      { month: 'February', percentage: 95 },
      { month: 'March', percentage: 92 },
      { month: 'April', percentage: 97 }
    ],
    imageGallery: [
      { id: 1, url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop', date: '2024-01-15', description: 'School sports day' },
      { id: 2, url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=200&h=200&fit=crop', date: '2024-02-20', description: 'Science fair presentation' },
      { id: 3, url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop', date: '2024-03-10', description: 'Achievement ceremony' },
      { id: 4, url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop', date: '2024-04-05', description: 'Class photo' }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: GraduationCap },
    { id: 'gallery', label: 'Photo Gallery', icon: Camera }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.profileImage} alt={student.name} />
              <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{student.grade} - {student.class}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Student
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium">{student.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                        <p className="font-medium">{student.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment Date</p>
                        <p className="font-medium">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                        {student.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Parent/Guardian</p>
                      <p className="font-medium">{student.parentName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.parentPhone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Academic Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{student.gpa}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current GPA</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{student.attendance}%</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Emergency Contact</p>
                  <p className="font-medium text-sm">{student.emergencyContact}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {student.recentGrades.map((grade, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <p className="font-medium text-gray-900 dark:text-white">{grade.subject}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{grade.grade}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{grade.score}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {student.attendanceHistory.map((record, index) => (
                  <div key={index} className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white">{record.month}</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{record.percentage}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'gallery' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Photo Gallery</span>
              </div>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {student.imageGallery.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    <img
                      src={image.url}
                      alt={image.description}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{image.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(image.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewStudent;
