import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Users,
  UserCheck,
  Clock,
  MapPin,
  Smartphone
} from 'lucide-react';

// Simple toast utility
const toast = {
  success: (message: string) => alert(`Success: ${message}`),
  error: (message: string) => alert(`Error: ${message}`),
  warning: (message: string) => alert(`Warning: ${message}`)
};

interface QRScanResult {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  timestamp: string;
  location?: string;
  status: 'PRESENT' | 'LATE';
}

interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  period: string;
  date: string;
  qrCode: string;
  active: boolean;
  scannedStudents: QRScanResult[];
}

const QRAttendanceScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResults, setScannedResults] = useState<QRScanResult[]>([]);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [scannerError, setScannerError] = useState<string>('');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(permission.state as 'granted' | 'denied' | 'prompt');
      
      permission.onchange = () => {
        setCameraPermission(permission.state as 'granted' | 'denied' | 'prompt');
      };
    } catch (error) {
      console.error('Error checking camera permission:', error);
    }
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setScannerError('');
        setCameraPermission('granted');
        
        // In a real implementation, you would integrate with a QR code library
        // like qr-scanner, jsQR, or @zxing/browser
        toast.success('Camera started. Point at QR code to scan.');
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setScannerError('Failed to access camera. Please check permissions.');
      setCameraPermission('denied');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleManualQRInput = async () => {
    if (!manualInput.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    await processQRCode(manualInput.trim());
    setManualInput('');
  };

  const processQRCode = async (qrData: string) => {
    try {
      let parsedData;

      // Try to parse as JSON (new session-based format)
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        // Fall back to legacy format (studentId|classId|sessionId)
        const parts = qrData.split('|');
        if (parts.length < 3) {
          toast.error('Invalid QR code format');
          return;
        }

        parsedData = {
          sessionId: parts[2],
          type: 'attendance',
          v: '1.0' // legacy version
        };
      }

      // Validate QR data structure
      if (!parsedData.sessionId || parsedData.type !== 'attendance') {
        toast.error('Invalid attendance QR code');
        return;
      }

      // Get current location for geofencing if required
      const location = await getCurrentLocation();
      const gpsCoordinates = location ? {
        latitude: parseFloat(location.split(',')[0]),
        longitude: parseFloat(location.split(',')[1])
      } : null;

      const response = await fetch('/api/attendance/qr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          qrData: JSON.stringify(parsedData),
          location: location,
          gpsCoordinates: gpsCoordinates
        })
      });

      if (response.ok) {
        const result = await response.json();
        const student = result.data.student;
        const scanResult: QRScanResult = {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          admissionNumber: student.admissionNumber,
          classId: result.data.classId,
          className: result.data.class.name,
          timestamp: new Date().toISOString(),
          location: location,
          status: result.data.status as 'PRESENT' | 'LATE'
        };

        setScannedResults(prev => [scanResult, ...prev]);
        toast.success(`${scanResult.studentName} marked ${scanResult.status.toLowerCase()}`);

        // Play success sound if available
        try {
          const audio = new Audio('/sounds/scan-success.mp3');
          audio.play().catch(() => {}); // Ignore if sound file doesn't exist
        } catch {}

      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to process attendance');

        // Play error sound if available
        try {
          const audio = new Audio('/sounds/scan-error.mp3');
          audio.play().catch(() => {});
        } catch {}
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Failed to process QR code');
    }
  };

  const getCurrentLocation = async (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(`${position.coords.latitude},${position.coords.longitude}`);
          },
          (error) => {
            console.log('Location access denied:', error);
            resolve(undefined);
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      } else {
        resolve(undefined);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-50 border-green-200';
      case 'LATE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle2 className="h-4 w-4" />;
      case 'LATE': return <Clock className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Attendance Scanner</h1>
          <p className="text-gray-600 dark:text-gray-400">Scan QR codes or enter manually for quick attendance</p>
        </div>
        <div className="flex space-x-3">
          {isScanning ? (
            <Button onClick={stopScanning} variant="outline">
              <XCircle className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          ) : (
            <Button onClick={startScanning} disabled={cameraPermission === 'denied'}>
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          )}
          <Button variant="outline" onClick={() => setScannedResults([])}>
            Clear Results
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Permission Status */}
            {cameraPermission === 'denied' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Camera access denied. Please enable camera permissions in your browser settings.
                </AlertDescription>
              </Alert>
            )}

            {scannerError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{scannerError}</AlertDescription>
              </Alert>
            )}

            {/* Camera View */}
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                style={{ display: isScanning ? 'block' : 'none' }}
              />
              {!isScanning && (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>Click "Start Camera" to begin scanning</p>
                  </div>
                </div>
              )}
              
              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-blue-500 rounded-lg w-48 h-48 border-dashed animate-pulse" />
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="space-y-2">
              <Label htmlFor="manual-qr">Manual QR Code Input</Label>
              <div className="flex space-x-2">
                <Input
                  id="manual-qr"
                  placeholder="Enter QR code data manually"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualQRInput()}
                />
                <Button onClick={handleManualQRInput} variant="outline">
                  <Smartphone className="h-4 w-4 mr-1" />
                  Submit
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Use this if camera scanning isn't working or for testing
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Scan Results
              </div>
              <Badge variant="outline">
                {scannedResults.length} scanned
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scannedResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No students scanned yet</p>
                <p className="text-sm">QR scan results will appear here</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {scannedResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {result.studentName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{result.studentName}</p>
                        <p className="text-sm text-gray-600">
                          {result.admissionNumber} • {result.className}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                          {result.location && (
                            <>
                              <MapPin className="h-3 w-3" />
                              <span>Location tracked</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={`${getStatusColor(result.status)} flex items-center space-x-1`}>
                      {getStatusIcon(result.status)}
                      <span>{result.status}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {scannedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {scannedResults.length}
                </div>
                <div className="text-sm text-gray-600">Total Scanned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {scannedResults.filter(r => r.status === 'PRESENT').length}
                </div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {scannedResults.filter(r => r.status === 'LATE').length}
                </div>
                <div className="text-sm text-gray-600">Late</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {scannedResults.filter(r => r.location).length}
                </div>
                <div className="text-sm text-gray-600">With Location</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use QR Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">For Teachers:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Generate QR codes from the Attendance Dashboard</li>
                <li>• Display QR code on screen or projector</li>
                <li>• Monitor scan results in real-time</li>
                <li>• Export attendance data when complete</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Students:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Use mobile device to scan QR code</li>
                <li>• Ensure good lighting for accurate scanning</li>
                <li>• Wait for confirmation message</li>
                <li>• Contact teacher if scanning fails</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
};

export default QRAttendanceScanner;
