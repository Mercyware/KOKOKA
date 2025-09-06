import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface Curriculum {
  id: string;
  name: string;
  description?: string;
  version: string;
  type: string;
  status: string;
  startYear?: number;
  endYear?: number;
  subjects: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

interface CurriculumStats {
  totalCurricula: number;
  activeCurricula: number;
  draftCurricula: number;
  totalSubjects: number;
}

const statusConfig = {
  DRAFT: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
  ACTIVE: { label: 'Active', variant: 'default' as const, icon: CheckCircle },
  INACTIVE: { label: 'Inactive', variant: 'destructive' as const, icon: AlertCircle },
  ARCHIVED: { label: 'Archived', variant: 'outline' as const, icon: Archive },
  UNDER_REVIEW: { label: 'Under Review', variant: 'default' as const, icon: Clock },
};

const typeConfig = {
  STANDARD: { label: 'Standard', color: 'bg-blue-100 text-blue-800' },
  CAMBRIDGE: { label: 'Cambridge', color: 'bg-green-100 text-green-800' },
  IB: { label: 'IB', color: 'bg-purple-100 text-purple-800' },
  NATIONAL: { label: 'National', color: 'bg-red-100 text-red-800' },
  STEM: { label: 'STEM', color: 'bg-yellow-100 text-yellow-800' },
  ARTS: { label: 'Arts', color: 'bg-pink-100 text-pink-800' },
  VOCATIONAL: { label: 'Vocational', color: 'bg-orange-100 text-orange-800' },
  CUSTOM: { label: 'Custom', color: 'bg-gray-100 text-gray-800' },
};

const CurriculumList: React.FC = () => {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [stats, setStats] = useState<CurriculumStats>({
    totalCurricula: 0,
    activeCurricula: 0,
    draftCurricula: 0,
    totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCurricula();
  }, [currentPage, searchTerm, typeFilter, statusFilter]);

  const fetchCurricula = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/curricula?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch curricula');
      }

      const data = await response.json();
      setCurricula(data.curricula);
      setTotalPages(Math.ceil(data.total / 10));
      
      // Calculate stats
      setStats({
        totalCurricula: data.total,
        activeCurricula: data.curricula.filter((c: Curriculum) => c.status === 'ACTIVE').length,
        draftCurricula: data.curricula.filter((c: Curriculum) => c.status === 'DRAFT').length,
        totalSubjects: data.curricula.reduce((sum: number, c: Curriculum) => sum + c.subjects.length, 0),
      });
    } catch (error) {
      console.error('Error fetching curricula:', error);
      toast({
        title: "Error",
        description: "Failed to fetch curricula. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the curriculum "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/curricula/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete curriculum');
      }

      toast({
        title: "Success",
        description: "Curriculum deleted successfully.",
      });

      fetchCurricula();
    } catch (error) {
      console.error('Error deleting curriculum:', error);
      toast({
        title: "Error",
        description: "Failed to delete curriculum. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Curriculum Management</h1>
          <p className="text-gray-600 mt-2">Manage and organize your school's curricula</p>
        </div>
        <Link to="/school-settings/curricula/create">
          <Button intent="primary" leftIcon={<Plus />}>
            Add Curriculum
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Curricula</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCurricula}</div>
            <p className="text-xs text-muted-foreground">
              All curriculum programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Curricula</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCurricula}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Curricula</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.draftCurricula}</div>
            <p className="text-xs text-muted-foreground">
              In development
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Across all curricula
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific curricula</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search curricula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Curricula List */}
      <Card>
        <CardHeader>
          <CardTitle>Curricula ({stats.totalCurricula})</CardTitle>
          <CardDescription>Manage your curriculum programs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading curricula...</p>
              </div>
            </div>
          ) : curricula.length === 0 ? (
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                No curricula found. Create your first curriculum to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {curricula.map((curriculum) => {
                const StatusIcon = statusConfig[curriculum.status as keyof typeof statusConfig]?.icon || Clock;
                const typeStyle = typeConfig[curriculum.type as keyof typeof typeConfig];
                
                return (
                  <div
                    key={curriculum.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{curriculum.name}</h3>
                        <Badge 
                          variant={statusConfig[curriculum.status as keyof typeof statusConfig]?.variant || 'default'}
                          className="flex items-center gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[curriculum.status as keyof typeof statusConfig]?.label || curriculum.status}
                        </Badge>
                        {typeStyle && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyle.color}`}>
                            {typeStyle.label}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {curriculum.description && (
                          <p>{curriculum.description}</p>
                        )}
                        <div className="flex items-center gap-4">
                          <span>Version: {curriculum.version}</span>
                          <span>{curriculum.subjects.length} subjects</span>
                          {curriculum.startYear && curriculum.endYear && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {curriculum.startYear} - {curriculum.endYear}
                            </span>
                          )}
                          <span>Updated {formatDate(curriculum.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button intent="ghost" size="sm" leftIcon={<MoreHorizontal />} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigate(`/school-settings/curricula/${curriculum.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/school-settings/curricula/${curriculum.id}/edit`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(curriculum.id, curriculum.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <Button
              intent="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              intent="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default CurriculumList;
