import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Mail, Phone, Grid, List, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StudentsManagerProps {
  onAddStudent: () => void;
  onViewStudent: (studentId: number) => void;
}

const StudentsManager = ({ onAddStudent, onViewStudent }: StudentsManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const students = [
    {
      id: 1,
      name: 'Emma Johnson',
      email: 'emma.j@school.edu',
      grade: '10th Grade',
      class: '10-A',
      phone: '+1 234-567-8901',
      status: 'Active',
      gpa: 3.8,
      attendance: 95
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@school.edu',
      grade: '11th Grade',
      class: '11-B',
      phone: '+1 234-567-8902',
      status: 'Active',
      gpa: 3.6,
      attendance: 88
    },
    {
      id: 3,
      name: 'Sarah Williams',
      email: 'sarah.w@school.edu',
      grade: '9th Grade',
      class: '9-C',
      phone: '+1 234-567-8903',
      status: 'Active',
      gpa: 3.9,
      attendance: 97
    },
    {
      id: 4,
      name: 'David Rodriguez',
      email: 'david.r@school.edu',
      grade: '12th Grade',
      class: '12-A',
      phone: '+1 234-567-8904',
      status: 'Active',
      gpa: 3.4,
      attendance: 85
    }
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {filteredStudents.map((student) => (
        <Card key={student.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{student.grade} - {student.class}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {student.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 truncate">{student.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{student.phone}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{student.gpa}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">GPA</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{student.attendance}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => onViewStudent(student.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="hidden md:table-cell">Grade</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Phone</TableHead>
              <TableHead className="text-center">GPA</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Attendance</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.class}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{student.grade}</TableCell>
                <TableCell className="hidden lg:table-cell">{student.email}</TableCell>
                <TableCell className="hidden lg:table-cell">{student.phone}</TableCell>
                <TableCell className="text-center font-medium">{student.gpa}</TableCell>
                <TableCell className="text-center hidden sm:table-cell">{student.attendance}%</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onViewStudent(student.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage student information and academic records</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAddStudent}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students by name, email, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {viewMode === 'cards' ? renderCardView() : renderTableView()}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">94.2%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">3.7</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg. GPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">42</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentsManager;
