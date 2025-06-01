import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, FileText, Users, School } from 'lucide-react';

interface ClassArm {
  id: number;
  name: string;
  classId: number;
  className: string;
  teacherId: number | null;
  teacherName: string | null;
  studentCount: number;
  createdAt: string;
}

const ClassArmsList = () => {
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, fetch class arms from API
    // For demo, we'll use mock data
    const mockClassArms: ClassArm[] = [
      {
        id: 1,
        name: 'A',
        classId: 1,
        className: 'Primary 1',
        teacherId: 101,
        teacherName: 'John Smith',
        studentCount: 35,
        createdAt: '2023-01-15T08:30:00Z',
      },
      {
        id: 2,
        name: 'B',
        classId: 1,
        className: 'Primary 1',
        teacherId: 102,
        teacherName: 'Sarah Johnson',
        studentCount: 32,
        createdAt: '2023-01-15T09:15:00Z',
      },
      {
        id: 3,
        name: 'C',
        classId: 1,
        className: 'Primary 1',
        teacherId: 103,
        teacherName: 'Michael Brown',
        studentCount: 30,
        createdAt: '2023-01-15T10:00:00Z',
      },
      {
        id: 4,
        name: 'A',
        classId: 2,
        className: 'Primary 2',
        teacherId: 104,
        teacherName: 'Emily Davis',
        studentCount: 33,
        createdAt: '2023-01-16T08:30:00Z',
      },
      {
        id: 5,
        name: 'B',
        classId: 2,
        className: 'Primary 2',
        teacherId: 105,
        teacherName: 'Robert Wilson',
        studentCount: 31,
        createdAt: '2023-01-16T09:15:00Z',
      },
      {
        id: 6,
        name: 'A',
        classId: 3,
        className: 'Primary 3',
        teacherId: 106,
        teacherName: 'Jennifer Taylor',
        studentCount: 34,
        createdAt: '2023-01-17T08:30:00Z',
      },
      {
        id: 7,
        name: 'B',
        classId: 3,
        className: 'Primary 3',
        teacherId: null,
        teacherName: null,
        studentCount: 29,
        createdAt: '2023-01-17T09:15:00Z',
      },
    ];

    setTimeout(() => {
      setClassArms(mockClassArms);
      setLoading(false);
    }, 800);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredClassArms = classArms.filter(
    (classArm) =>
      classArm.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classArm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classArm.teacherName && classArm.teacherName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this class arm?')) {
      // In a real app, call API to delete
      setClassArms(classArms.filter((classArm) => classArm.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Class Arms</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Class Arm
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Class Arms</CardTitle>
              <CardDescription>
                Manage class arms and their assigned teachers
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search class arms..."
                className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredClassArms.length === 0 ? (
            <div className="text-center py-10">
              <School className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Class Arms Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm
                  ? `No class arms matching "${searchTerm}"`
                  : "You haven't added any class arms yet."}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Class</th>
                    <th className="py-3 px-4 text-left font-medium">Arm</th>
                    <th className="py-3 px-4 text-left font-medium">Class Teacher</th>
                    <th className="py-3 px-4 text-left font-medium">Students</th>
                    <th className="py-3 px-4 text-left font-medium">Created</th>
                    <th className="py-3 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassArms.map((classArm) => (
                    <tr key={classArm.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{classArm.className}</td>
                      <td className="py-3 px-4">{classArm.name}</td>
                      <td className="py-3 px-4">
                        {classArm.teacherName || (
                          <span className="text-muted-foreground italic">Not assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          {classArm.studentCount}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(classArm.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dashboard/academics/class-arms/${classArm.id}`}>
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dashboard/academics/class-arms/${classArm.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(classArm.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassArmsList;
