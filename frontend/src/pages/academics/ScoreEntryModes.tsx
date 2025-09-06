import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { 
  ClipboardList, 
  Zap, 
  Grid3X3, 
  Keyboard, 
  ChartBar, 
  Upload,
  ArrowRight,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

const ScoreEntryModes = () => {
  const navigate = useNavigate();

  const entryModes = [
    {
      id: 'standard',
      title: 'Standard Entry',
      description: 'Comprehensive score entry with all features',
      icon: ClipboardList,
      route: '/academics/scores/standard',
      features: [
        'Full assessment filtering',
        'CSV import/export',
        'Table and card views',
        'Bulk operations',
        'Search and pagination'
      ],
      bestFor: 'Complete score management with full control',
      color: 'blue',
      badge: 'Full Featured'
    },
    {
      id: 'quick-entry',
      title: 'Quick Entry',
      description: 'Lightning-fast score entry with keyboard shortcuts',
      icon: Zap,
      route: '/academics/scores/quick-entry',
      features: [
        'Keyboard navigation (Tab, Enter)',
        'Auto-save functionality',
        'Progress tracking',
        'Student-to-student navigation',
        'Validation alerts'
      ],
      bestFor: 'Fast data entry when you have scores ready',
      color: 'green',
      badge: 'Speed Focused'
    },
    {
      id: 'gradebook',
      title: 'Grade Book View',
      description: 'Traditional gradebook interface with statistics',
      icon: Grid3X3,
      route: '/academics/scores/gradebook',
      features: [
        'Spreadsheet-like interface',
        'Grade statistics dashboard',
        'Color-coded performance',
        'Class overview',
        'Customizable columns'
      ],
      bestFor: 'Traditional grading workflow with analytics',
      color: 'purple',
      badge: 'Analytics Rich'
    }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBadgeVariant = (color: string) => {
    switch (color) {
      case 'blue': return 'default';
      case 'green': return 'secondary';
      case 'purple': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Choose Your Score Entry Mode</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the interface that best fits your workflow. Each mode is optimized for different use cases.
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entryModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card key={mode.id} className="relative h-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-full ${getIconColor(mode.color)} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{mode.title}</CardTitle>
                    <Badge variant={getBadgeVariant(mode.color)}>{mode.badge}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Key Features
                    </h4>
                    <ul className="space-y-1">
                      {mode.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Best For */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Best For
                    </h4>
                    <p className="text-sm text-muted-foreground">{mode.bestFor}</p>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => navigate(mode.route)}
                    className="w-full mt-4"
                    variant={mode.color === 'blue' ? 'default' : 'outline'}
                  >
                    Start {mode.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Guide */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Keyboard className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-medium">For Speed</p>
                <p className="text-muted-foreground">Choose Quick Entry if you want to input scores rapidly with keyboard shortcuts</p>
              </div>
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="font-medium">For Analysis</p>
                <p className="text-muted-foreground">Choose Grade Book for visual analytics and traditional spreadsheet-style entry</p>
              </div>
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">For Flexibility</p>
                <p className="text-muted-foreground">Choose Standard Entry for CSV imports, bulk operations, and comprehensive features</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="text-center pt-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ScoreEntryModes;
