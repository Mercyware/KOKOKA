
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, X, BookOpen } from 'lucide-react';

const AddStudentScores = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [scores, setScores] = useState([
    { id: 1, subject: '', score: '', maxScore: '', comments: '' }
  ]);

  const students = [
    { id: 1, name: 'Emma Johnson', class: '10-A' },
    { id: 2, name: 'Michael Brown', class: '10-A' },
    { id: 3, name: 'Sarah Davis', class: '10-B' },
    { id: 4, name: 'James Wilson', class: '10-B' }
  ];

  const subjects = [
    'Mathematics',
    'English Language',
    'Science',
    'History',
    'Geography',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Art'
  ];

  const addScore = () => {
    setScores([...scores, { id: Date.now(), subject: '', score: '', maxScore: '', comments: '' }]);
  };

  const removeScore = (id: number) => {
    setScores(scores.filter(score => score.id !== id));
  };

  const updateScore = (id: number, field: string, value: string) => {
    setScores(scores.map(score => 
      score.id === id ? { ...score, [field]: value } : score
    ));
  };

  const handleSave = () => {
    console.log('Saving scores:', { studentId: selectedStudent, scores });
    // In real app, save to backend
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Student Scores</h1>
          <p className="text-gray-600 dark:text-gray-400">Record and manage student academic performance</p>
        </div>
        <Button onClick={handleSave} variant="default" intent="primary">
          <Save className="h-4 w-4 mr-2" />
          Save All Scores
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Student Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} - {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedStudent && (
              <div className="flex items-end">
                <Badge variant="secondary" className="h-fit">
                  Selected: {students.find(s => s.id.toString() === selectedStudent)?.name}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Score Entry</span>
            <Button onClick={addScore} size="sm" variant="outline" intent="cancel">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scores.map((score, index) => (
            <div key={score.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Subject {index + 1}</h3>
                {scores.length > 1 && (
                  <Button
                    onClick={() => removeScore(score.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`subject-${score.id}`}>Subject</Label>
                  <Select
                    value={score.subject}
                    onValueChange={(value) => updateScore(score.id, 'subject', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`score-${score.id}`}>Score Obtained</Label>
                  <Input
                    id={`score-${score.id}`}
                    type="number"
                    placeholder="85"
                    value={score.score}
                    onChange={(e) => updateScore(score.id, 'score', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`maxScore-${score.id}`}>Maximum Score</Label>
                  <Input
                    id={`maxScore-${score.id}`}
                    type="number"
                    placeholder="100"
                    value={score.maxScore}
                    onChange={(e) => updateScore(score.id, 'maxScore', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Percentage</Label>
                  <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {score.score && score.maxScore ? 
                      `${Math.round((parseInt(score.score) / parseInt(score.maxScore)) * 100)}%` : 
                      '-%'
                    }
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`comments-${score.id}`}>Comments (Optional)</Label>
                <Textarea
                  id={`comments-${score.id}`}
                  placeholder="Additional notes about performance..."
                  value={score.comments}
                  onChange={(e) => updateScore(score.id, 'comments', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStudentScores;
