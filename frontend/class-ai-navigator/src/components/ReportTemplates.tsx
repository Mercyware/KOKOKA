
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, FileText, Award, GraduationCap, Star, Trophy, BookOpen } from 'lucide-react';

const ReportTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const templates = [
    {
      id: 'classic',
      name: 'Classic Report Card',
      description: 'Traditional academic report with grades and comments',
      icon: FileText,
      preview: '/api/placeholder/400/300',
      features: ['Subject grades', 'Teacher comments', 'Attendance record', 'Overall GPA']
    },
    {
      id: 'modern',
      name: 'Modern Academic Report',
      description: 'Contemporary design with visual grade representations',
      icon: GraduationCap,
      preview: '/api/placeholder/400/300',
      features: ['Visual grade charts', 'Progress tracking', 'Skills assessment', 'Digital signatures']
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Assessment',
      description: 'Detailed report including extracurricular activities',
      icon: Award,
      preview: '/api/placeholder/400/300',
      features: ['Academic performance', 'Extracurricular activities', 'Behavioral assessment', 'Recommendations']
    },
    {
      id: 'skills-based',
      name: 'Skills-Based Report',
      description: 'Focus on skill development and competencies',
      icon: Star,
      preview: '/api/placeholder/400/300',
      features: ['Competency mapping', 'Skill progression', 'Learning objectives', 'Future goals']
    },
    {
      id: 'honors',
      name: 'Honors & Awards Report',
      description: 'Highlight achievements and special recognitions',
      icon: Trophy,
      preview: '/api/placeholder/400/300',
      features: ['Achievement highlights', 'Awards & honors', 'Leadership roles', 'Special mentions']
    },
    {
      id: 'subject-detailed',
      name: 'Subject-Detailed Report',
      description: 'In-depth analysis of each subject performance',
      icon: BookOpen,
      preview: '/api/placeholder/400/300',
      features: ['Subject breakdowns', 'Topic-wise scores', 'Improvement areas', 'Study recommendations']
    }
  ];

  const students = [
    { id: 1, name: 'Emma Johnson', class: '10-A', gpa: 3.8 },
    { id: 2, name: 'Michael Brown', class: '10-A', gpa: 3.6 },
    { id: 3, name: 'Sarah Davis', class: '10-B', gpa: 3.9 },
    { id: 4, name: 'James Wilson', class: '10-B', gpa: 3.7 }
  ];

  const generateReport = () => {
    console.log('Generating report:', { template: selectedTemplate, student: selectedStudent });
    // In real app, generate PDF report
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report Card Templates</h1>
          <p className="text-gray-600 dark:text-gray-400">Choose from various report card formats and generate student reports</p>
        </div>
        <Button 
          onClick={generateReport}
          disabled={!selectedTemplate || !selectedStudent}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student & Template Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} - {student.class} (GPA: {student.gpa})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate === template.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                  </div>
                  {selectedTemplate === template.id && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Selected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <IconComponent className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Template Preview</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Features:</h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Sample
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReportTemplates;
