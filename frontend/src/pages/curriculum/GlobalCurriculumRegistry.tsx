import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  Globe,
  Search,
  Filter,
  BookOpen,
  Download,
  Star,
  Users,
  Eye,
  Calendar,
  Tag,
  CheckCircle,
  Award,
  TrendingUp,
  Building,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface GlobalCurriculum {
  id: string;
  name: string;
  description?: string;
  version?: string;
  type: string;
  provider: string;
  country?: string;
  language: string;
  minGrade: number;
  maxGrade: number;
  difficulty: string;
  isOfficial: boolean;
  licenseType: string;
  adoptionCount: number;
  tags: string[];
  createdAt: string;
  globalSubjects: Array<{
    id: string;
    name: string;
    code: string;
    gradeLevel: number;
    category?: string;
    isCore: boolean;
  }>;
  _count: {
    schoolCurricula: number;
    globalSubjects: number;
  };
}

interface CurriculumStats {
  totalCurricula: number;
  totalAdoptions: number;
  byType: Array<{
    type: string;
    _count: { id: number };
    _sum: { adoptionCount: number };
  }>;
  topProviders: Array<{
    provider: string;
    _count: { id: number };
    _sum: { adoptionCount: number };
  }>;
}

const typeConfig = {
  STANDARD: { label: 'Standard', color: 'bg-blue-100 text-blue-800', icon: BookOpen },
  CAMBRIDGE: { label: 'Cambridge', color: 'bg-green-100 text-green-800', icon: Award },
  IB: { label: 'IB', color: 'bg-purple-100 text-purple-800', icon: Globe },
  NATIONAL: { label: 'National', color: 'bg-red-100 text-red-800', icon: Building },
  STEM: { label: 'STEM', color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp },
  ARTS: { label: 'Arts', color: 'bg-pink-100 text-pink-800', icon: Star },
  VOCATIONAL: { label: 'Vocational', color: 'bg-orange-100 text-orange-800', icon: Users },
  CUSTOM: { label: 'Custom', color: 'bg-gray-100 text-gray-800', icon: BookOpen },
};

const difficultyConfig = {
  BEGINNER: { label: 'Beginner', color: 'bg-green-100 text-green-800' },
  STANDARD: { label: 'Standard', color: 'bg-blue-100 text-blue-800' },
  ADVANCED: { label: 'Advanced', color: 'bg-red-100 text-red-800' },
};

const GlobalCurriculumRegistry: React.FC = () => {
  const [curricula, setCurricula] = useState<GlobalCurriculum[]>([]);
  const [stats, setStats] = useState<CurriculumStats | null>(null);
  const [selectedCurriculum, setSelectedCurriculum] = useState<GlobalCurriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdoptDialog, setShowAdoptDialog] = useState(false);
  const [adoptionData, setAdoptionData] = useState({ name: '', description: '', customizations: false });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchGlobalCurricula();
    fetchStats();
  }, [currentPage, searchTerm, typeFilter, countryFilter, providerFilter, difficultyFilter]);

  const fetchGlobalCurricula = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(countryFilter !== 'all' && { country: countryFilter }),
        ...(providerFilter !== 'all' && { provider: providerFilter }),
        ...(difficultyFilter !== 'all' && { difficulty: difficultyFilter }),
      });

      const response = await fetch(`/api/global-curricula?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch global curricula');

      const data = await response.json();
      setCurricula(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching global curricula:', error);
      toast({
        title: "Error",
        description: "Failed to fetch global curricula. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/global-curricula/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdoptCurriculum = async () => {
    if (!selectedCurriculum) return;

    try {
      const response = await fetch(`/api/global-curricula/${selectedCurriculum.id}/adopt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
        },
        body: JSON.stringify(adoptionData),
      });

      if (!response.ok) throw new Error('Failed to adopt curriculum');

      toast({
        title: "Success",
        description: "Curriculum adopted successfully! You can now customize it in your school settings.",
      });

      setShowAdoptDialog(false);
      setSelectedCurriculum(null);
      setAdoptionData({ name: '', description: '', customizations: false });
      
      // Navigate to school curricula
      setTimeout(() => {
        navigate('/school-settings/curricula');
      }, 1500);
    } catch (error) {
      console.error('Error adopting curriculum:', error);
      toast({
        title: "Error",
        description: "Failed to adopt curriculum. Please try again.",
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
          <h1 className="text-3xl font-bold text-gray-900">Global Curriculum Registry</h1>
          <p className="text-gray-600 mt-2">Browse and adopt curriculum templates from leading education providers worldwide</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/curriculum/school')}>
          <ArrowRight className="h-4 w-4 mr-2" />
          My School Curricula
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Curricula</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCurricula}</div>
              <p className="text-xs text-muted-foreground">
                Available templates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Adoptions</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAdoptions}</div>
              <p className="text-xs text-muted-foreground">
                Schools worldwide
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Provider</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{stats.topProviders[0]?.provider || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                {stats.topProviders[0]?._count?.id || 0} curricula
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular Type</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {typeConfig[stats.byType[0]?.type as keyof typeof typeConfig]?.label || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.byType[0]?._sum?.adoptionCount || 0} adoptions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find curriculum templates that match your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search curricula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
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

            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="Cambridge">Cambridge</SelectItem>
                <SelectItem value="IB">IB Organization</SelectItem>
                <SelectItem value="National">National Boards</SelectItem>
                <SelectItem value="Pearson">Pearson</SelectItem>
                <SelectItem value="McGraw-Hill">McGraw-Hill</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {Object.entries(difficultyConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="SG">Singapore</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Curricula Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : curricula.length === 0 ? (
          <div className="col-span-full">
            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                No curricula found matching your filters. Try adjusting your search criteria.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          curricula.map((curriculum) => {
            const typeStyle = typeConfig[curriculum.type as keyof typeof typeConfig];
            const difficultyStyle = difficultyConfig[curriculum.difficulty as keyof typeof difficultyConfig];
            const IconComponent = typeStyle?.icon || BookOpen;

            return (
              <Card key={curriculum.id} className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="h-4 w-4 text-gray-600 flex-shrink-0" />
                        <CardTitle className="text-lg truncate">{curriculum.name}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {curriculum.description}
                      </CardDescription>
                    </div>
                    {curriculum.isOfficial && (
                      <Badge variant="default" className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <CheckCircle className="h-3 w-3" />
                        Official
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{curriculum.provider}</span>
                    {curriculum.country && (
                      <>
                        <span>•</span>
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{curriculum.country}</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {typeStyle && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyle.color} flex-shrink-0`}>
                        {typeStyle.label}
                      </span>
                    )}
                    {difficultyStyle && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyStyle.color} flex-shrink-0`}>
                        {difficultyStyle.label}
                      </span>
                    )}
                    <Badge variant="outline" className="flex-shrink-0">
                      Grades {curriculum.minGrade}-{curriculum.maxGrade}
                    </Badge>
                    <Badge variant="outline" className="flex-shrink-0">
                      {curriculum._count.globalSubjects} subjects
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex flex-col gap-1 text-sm text-gray-500 flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 flex-shrink-0" />
                        <span>{curriculum.adoptionCount} adoptions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 flex-shrink-0" />
                        <span>{curriculum.licenseType}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCurriculum(curriculum)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedCurriculum(curriculum);
                          setAdoptionData({
                            name: `${curriculum.name} - ${localStorage.getItem('schoolName') || 'Our School'}`,
                            description: `Adopted from ${curriculum.name} by ${curriculum.provider}`,
                            customizations: false
                          });
                          setShowAdoptDialog(true);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Adopt
                      </Button>
                    </div>
                  </div>

                  {curriculum.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {curriculum.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {curriculum.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{curriculum.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Curriculum Details Dialog */}
      <Dialog open={!!selectedCurriculum && !showAdoptDialog} onOpenChange={() => setSelectedCurriculum(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedCurriculum?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedCurriculum?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCurriculum && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Provider Details</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Provider:</strong> {selectedCurriculum.provider}</div>
                    <div><strong>Type:</strong> {typeConfig[selectedCurriculum.type as keyof typeof typeConfig]?.label}</div>
                    <div><strong>Country:</strong> {selectedCurriculum.country || 'International'}</div>
                    <div><strong>Language:</strong> {selectedCurriculum.language}</div>
                    <div><strong>License:</strong> {selectedCurriculum.licenseType}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Curriculum Details</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Grade Range:</strong> {selectedCurriculum.minGrade} - {selectedCurriculum.maxGrade}</div>
                    <div><strong>Difficulty:</strong> {difficultyConfig[selectedCurriculum.difficulty as keyof typeof difficultyConfig]?.label}</div>
                    <div><strong>Subjects:</strong> {selectedCurriculum._count.globalSubjects}</div>
                    <div><strong>Adoptions:</strong> {selectedCurriculum.adoptionCount} schools</div>
                    <div><strong>Version:</strong> {selectedCurriculum.version || 'Latest'}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Subjects Included</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCurriculum.globalSubjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{subject.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({subject.code})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Grade {subject.gradeLevel}</Badge>
                        {subject.isCore && (
                          <Badge variant="default">Core</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCurriculum.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCurriculum.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSelectedCurriculum(null)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (selectedCurriculum) {
                  setAdoptionData({
                    name: `${selectedCurriculum.name} - ${localStorage.getItem('schoolName') || 'Our School'}`,
                    description: `Adopted from ${selectedCurriculum.name} by ${selectedCurriculum.provider}`,
                    customizations: false
                  });
                  setShowAdoptDialog(true);
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Adopt This Curriculum
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adopt Curriculum Dialog */}
      <Dialog open={showAdoptDialog} onOpenChange={setShowAdoptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adopt Curriculum</DialogTitle>
            <DialogDescription>
              Customize how this curriculum will be implemented in your school
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Curriculum Name</label>
              <Input
                value={adoptionData.name}
                onChange={(e) => setAdoptionData({...adoptionData, name: e.target.value})}
                placeholder="Enter name for your curriculum"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-3 border rounded-md"
                rows={3}
                value={adoptionData.description}
                onChange={(e) => setAdoptionData({...adoptionData, description: e.target.value})}
                placeholder="Describe how you'll implement this curriculum"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="customizations"
                checked={adoptionData.customizations}
                onChange={(e) => setAdoptionData({...adoptionData, customizations: e.target.checked})}
              />
              <label htmlFor="customizations" className="text-sm">
                I plan to make customizations to this curriculum
              </label>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAdoptDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdoptCurriculum}>
              <Download className="h-4 w-4 mr-2" />
              Adopt Curriculum
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
};

export default GlobalCurriculumRegistry;