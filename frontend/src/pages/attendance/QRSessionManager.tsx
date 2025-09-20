import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Button,
  Form,
  FormField,
  StatusBadge,
  Input
} from '@/components/ui';
import {
  QrCode,
  Clock,
  Users,
  MapPin,
  Download,
  Share2,
  RefreshCw,
  Settings,
  Monitor,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

interface QRSession {
  sessionId: string;
  qrCodeDataURL: string;
  classInfo: {
    id: string;
    name: string;
    grade: string;
    totalStudents: number;
  };
  sessionInfo: {
    period: string;
    expiresAt: string;
    maxScans: number;
    requireLocation: boolean;
    locationRadius: number;
  };
  instructions: string;
}

interface SessionStatus {
  sessionId: string;
  classId: string;
  period: string;
  isActive: boolean;
  expiresAt: string;
  scanCount: number;
  maxScans: number;
  requireLocation: boolean;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  capacity: number;
}

const PERIODS = [
  { value: 'FULL_DAY', label: 'Full Day' },
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'PERIOD_1', label: 'Period 1' },
  { value: 'PERIOD_2', label: 'Period 2' },
  { value: 'PERIOD_3', label: 'Period 3' },
  { value: 'PERIOD_4', label: 'Period 4' },
  { value: 'PERIOD_5', label: 'Period 5' },
  { value: 'PERIOD_6', label: 'Period 6' }
];

const QRSessionManager: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentSession, setCurrentSession] = useState<QRSession | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [qrVisible, setQrVisible] = useState(true);

  // Form state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('FULL_DAY');
  const [expiresIn, setExpiresIn] = useState(3600); // 1 hour
  const [maxScans, setMaxScans] = useState(100);
  const [requireLocation, setRequireLocation] = useState(false);
  const [locationRadius, setLocationRadius] = useState(50);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (currentSession) {
      const interval = setInterval(() => {
        fetchSessionStatus();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const createQRSession = async () => {
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/attendance/qr-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          classId: selectedClassId,
          period: selectedPeriod,
          expiresIn,
          maxScans,
          requireLocation,
          locationRadius
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.data);
        setSessionStatus({
          sessionId: data.data.sessionId,
          classId: selectedClassId,
          period: selectedPeriod,
          isActive: true,
          expiresAt: data.data.sessionInfo.expiresAt,
          scanCount: 0,
          maxScans,
          requireLocation
        });
        toast.success('QR attendance session created successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create QR session');
      }
    } catch (error) {
      console.error('Error creating QR session:', error);
      toast.error('Failed to create QR session');
    } finally {
      setCreating(false);
    }
  };

  const fetchSessionStatus = async () => {
    if (!currentSession) return;

    try {
      const response = await fetch(`/api/attendance/qr-session/${currentSession.sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessionStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching session status:', error);
    }
  };

  const copyQRToClipboard = async () => {
    if (!currentSession) return;

    try {
      await navigator.clipboard.writeText(currentSession.qrCodeDataURL);
      toast.success('QR code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy QR code');
    }
  };

  const downloadQR = () => {
    if (!currentSession) return;

    const link = document.createElement('a');
    link.download = `attendance-qr-${currentSession.classInfo.name.replace(/\s+/g, '-')}-${selectedPeriod}.png`;
    link.href = currentSession.qrCodeDataURL;
    link.click();
  };

  const shareSession = async () => {
    if (!currentSession) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Attendance QR - ${currentSession.classInfo.name}`,
          text: `Scan this QR code to mark your attendance for ${currentSession.classInfo.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Session URL copied to clipboard');
    }
  };

  const endSession = () => {
    setCurrentSession(null);
    setSessionStatus(null);
    toast.success('QR session ended');
  };

  const getTimeRemaining = () => {
    if (!sessionStatus) return 'Unknown';

    const now = new Date().getTime();
    const expiry = new Date(sessionStatus.expiresAt).getTime();
    const remaining = expiry - now;

    if (remaining <= 0) return 'Expired';

    const minutes = Math.floor(remaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getSessionProgress = () => {
    if (!sessionStatus || !currentSession) return 0;
    const percentage = Math.min((sessionStatus.scanCount / currentSession.classInfo.totalStudents) * 100, 100);
    return Math.round(percentage);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              QR Session Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage QR code attendance sessions
            </p>
          </div>
          {currentSession && (
            <div className="flex space-x-3">
              <Button intent="secondary" size="sm" onClick={() => setQrVisible(!qrVisible)}>
                {qrVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {qrVisible ? 'Hide QR' : 'Show QR'}
              </Button>
              <Button intent="danger" size="sm" onClick={endSession}>
                End Session
              </Button>
            </div>
          )}
        </div>

        {!currentSession ? (
          /* Create Session Form */
          <Card>
            <CardHeader>
              <CardTitle>Create New QR Session</CardTitle>
            </CardHeader>
            <CardContent>
              <Form spacing="md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Class" required>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - {cls.grade} ({cls.capacity} students)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Period" required>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODS.map(period => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Session Duration (minutes)">
                    <Select value={expiresIn.toString()} onValueChange={(value) => setExpiresIn(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1800">30 minutes</SelectItem>
                        <SelectItem value="3600">1 hour</SelectItem>
                        <SelectItem value="7200">2 hours</SelectItem>
                        <SelectItem value="14400">4 hours</SelectItem>
                        <SelectItem value="28800">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Maximum Scans">
                    <Input
                      type="number"
                      value={maxScans}
                      onChange={(e) => setMaxScans(parseInt(e.target.value) || 0)}
                      min="1"
                      max="1000"
                    />
                  </FormField>
                </div>

                <div className="flex items-center space-x-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={requireLocation}
                      onCheckedChange={setRequireLocation}
                      id="require-location"
                    />
                    <Label htmlFor="require-location">Require Location Verification</Label>
                  </div>

                  {requireLocation && (
                    <FormField label="Location Radius (meters)" className="flex-1">
                      <Input
                        type="number"
                        value={locationRadius}
                        onChange={(e) => setLocationRadius(parseInt(e.target.value) || 0)}
                        min="5"
                        max="500"
                      />
                    </FormField>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    intent="primary"
                    onClick={createQRSession}
                    disabled={creating || !selectedClassId}
                    loading={creating}
                    loadingText="Creating Session..."
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Create QR Session
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        ) : (
          /* Active Session Display */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* QR Code Display */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>QR Code for {currentSession.classInfo.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button intent="secondary" size="sm" onClick={copyQRToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button intent="secondary" size="sm" onClick={downloadQR}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button intent="secondary" size="sm" onClick={shareSession}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {qrVisible ? (
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                      <img
                        src={currentSession.qrCodeDataURL}
                        alt="Attendance QR Code"
                        className="w-64 h-64 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      {currentSession.instructions}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">QR Code is hidden</p>
                    <p className="text-sm text-gray-400">Click "Show QR" to display</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Status */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sessionStatus && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <StatusBadge
                          variant={sessionStatus.isActive ? "success" : "danger"}
                          icon={sessionStatus.isActive ? CheckCircle : XCircle}
                        >
                          {sessionStatus.isActive ? 'Active' : 'Expired'}
                        </StatusBadge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Time Remaining</span>
                        <Badge variant="outline" className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeRemaining()}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Scans</span>
                        <Badge variant="outline" className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {sessionStatus.scanCount} / {sessionStatus.maxScans}
                        </Badge>
                      </div>

                      {sessionStatus.requireLocation && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Location Required</span>
                          <Badge variant="outline" className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {currentSession.sessionInfo.locationRadius}m
                          </Badge>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium">{getSessionProgress()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getSessionProgress()}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {sessionStatus.scanCount} of {currentSession.classInfo.totalStudents} students scanned
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button intent="action" className="w-full justify-start" size="sm">
                    <Monitor className="h-4 w-4 mr-2" />
                    View Live Results
                  </Button>
                  <Button intent="secondary" className="w-full justify-start" size="sm" onClick={fetchSessionStatus}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                  <Button intent="secondary" className="w-full justify-start" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Session Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QRSessionManager;