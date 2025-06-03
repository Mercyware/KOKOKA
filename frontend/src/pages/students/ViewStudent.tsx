import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Calendar, GraduationCap, TrendingUp, Camera, Upload, Eye } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import { getStudentById } from '@/services/studentService';


interface ViewStudentProps {
  studentId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ViewStudent = ({ studentId, onBack, onEdit }: ViewStudentProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStudentById(studentId)
      .then((res) => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load student data.');
        setLoading(false);
      });
  }, [studentId]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: GraduationCap },
    { id: 'gallery', label: 'Photo Gallery', icon: Camera }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <span className="text-lg">Loading student...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <span className="text-lg text-red-500">{error}</span>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <span className="text-lg text-gray-500">No student data found.</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.profileImage || student.photo || ''} alt={student.name || student.firstName || ''} />
                <AvatarFallback>
                  {(student.name || `${student.firstName || ''} ${student.lastName || ''}`)
                    .split(' ')
                    .map((n: string) => n?.[0] || '')
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {student.name || [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {(student.grade || '') + (student.class && student.class.name ? ` - ${student.class.name}` : '')}
                </p>
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
                          <p className="font-medium">{student.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="font-medium">{student.phone || student.contactInfo?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                          <p className="font-medium">
                            {typeof student.address === 'string'
                              ? student.address
                              : student.address
                              ? [student.address.street, student.address.city, student.address.state, student.address.country]
                                  .filter(Boolean)
                                  .join(', ')
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment Date</p>
                          <p className="font-medium">
                            {student.enrollmentDate
                              ? new Date(student.enrollmentDate).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                          {student.status || 'N/A'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Parent/Guardian</p>
                        <p className="font-medium">
                          {student.parentName || student.primaryGuardian?.firstName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.parentPhone || student.primaryGuardian?.phone || 'N/A'}
                        </p>
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
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {student.gpa || student.averageGrade?.toFixed?.(1) || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current GPA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {student.attendance || student.attendancePercentage?.toFixed?.(0) || 'N/A'}%
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Emergency Contact</p>
                    <p className="font-medium text-sm">
                      {student.emergencyContact ||
                        student.contactInfo?.emergencyContact?.name
                          ? `${student.contactInfo?.emergencyContact?.name} (${student.contactInfo?.emergencyContact?.phone})`
                          : 'N/A'}
                    </p>
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
                  {(student.recentGrades || student.grades || []).map((grade: any, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {grade.subject || grade.exam?.subject || 'N/A'}
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {grade.grade || grade.score || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {grade.score !== undefined ? `${grade.score}%` : ''}
                      </p>
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
                  {(student.attendanceHistory || student.attendance || []).map((record: any, index: number) => (
                    <div key={index} className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.month || (record.date && new Date(record.date).toLocaleDateString()) || 'N/A'}
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {record.percentage !== undefined
                          ? `${record.percentage}%`
                          : record.status
                          ? record.status
                          : ''}
                      </p>
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
                {(student.imageGallery || []).map((image: any) => (
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
    </Layout>
  );
};

export default ViewStudent;
