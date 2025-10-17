import React, { useState, useEffect, useRef } from 'react';
import {
  Building,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Settings as SettingsIcon,
  Bell,
  Lock,
  Palette,
  GraduationCap,
  Users,
  DollarSign,
  Loader2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  getSchoolSettings,
  updateGeneralInfo,
  updateAcademicSettings as updateAcademicSettingsService,
  updateSystemPreferences as updateSystemPreferencesService,
  updateNotificationSettings as updateNotificationSettingsService,
  updateFeatureToggles as updateFeatureTogglesService,
  uploadSchoolLogo
} from '@/services/schoolSettingsService';
import { useToast } from '@/hooks/use-toast';
import { resolveImageUrl, isValidImageFile, isValidImageSize } from '@/utils/imageUtils';

const SchoolSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General Information State
  const [generalInfo, setGeneralInfo] = useState({
    name: '',
    subdomain: '',
    logo: '',
    description: '',
    established: '',
    type: 'SECONDARY',
    email: '',
    phone: '',
    website: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  // Academic Settings State
  const [academicSettings, setAcademicSettings] = useState({
    gradingSystem: 'percentage',
    passingGrade: '50',
    maxGrade: '100',
    gradeScale: 'A-F',
    termSystem: 'semester',
    numberOfTerms: '2',
    attendanceTracking: true,
    lateThreshold: '15',
    absentAfter: '30'
  });

  // System Preferences State
  const [systemPreferences, setSystemPreferences] = useState({
    theme: 'light',
    primaryColor: '#2563eb',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    currency: 'USD'
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    parentNotifications: true,
    staffNotifications: true,
    dailyReport: false,
    weeklyReport: true,
    attendanceAlerts: true,
    gradeAlerts: true
  });

  // Feature Toggles State
  const [featureToggles, setFeatureToggles] = useState({
    attendance: true,
    gradebook: true,
    library: false,
    transportation: false,
    hostel: false,
    canteen: false,
    payroll: false,
    inventory: false,
    messaging: true,
    events: true
  });

  useEffect(() => {
    fetchSchoolSettings();
  }, []);

  const fetchSchoolSettings = async () => {
    setLoading(true);
    try {
      const school = await getSchoolSettings();

      // Set general information
      setGeneralInfo({
        name: school.name || '',
        subdomain: school.subdomain || '',
        logo: school.logo || '',
        description: school.description || '',
        established: school.established ? school.established.split('T')[0] : '',
        type: school.type || 'SECONDARY',
        email: school.email || '',
        phone: school.phone || '',
        website: school.website || '',
        streetAddress: school.streetAddress || '',
        city: school.city || '',
        state: school.state || '',
        zipCode: school.zipCode || '',
        country: school.country || ''
      });

      // Set logo preview if exists
      if (school.logo) {
        setLogoPreview(resolveImageUrl(school.logo));
      }

      // Set academic settings
      if (school.settings?.academic) {
        setAcademicSettings({
          gradingSystem: school.settings.academic.gradingSystem || 'percentage',
          passingGrade: school.settings.academic.passingGrade || '50',
          maxGrade: school.settings.academic.maxGrade || '100',
          gradeScale: school.settings.academic.gradeScale || 'A-F',
          termSystem: school.settings.academic.termSystem || 'semester',
          numberOfTerms: school.settings.academic.numberOfTerms || '2',
          attendanceTracking: school.settings.academic.attendanceTracking ?? true,
          lateThreshold: school.settings.academic.lateThreshold || '15',
          absentAfter: school.settings.academic.absentAfter || '30'
        });
      }

      // Set system preferences
      if (school.settings?.system) {
        setSystemPreferences({
          theme: school.settings.system.theme || 'light',
          primaryColor: school.settings.system.primaryColor || '#2563eb',
          language: school.settings.system.language || 'en',
          timezone: school.settings.system.timezone || 'UTC',
          dateFormat: school.settings.system.dateFormat || 'MM/DD/YYYY',
          timeFormat: school.settings.system.timeFormat || '12',
          currency: school.settings.system.currency || 'USD'
        });
      }

      // Set notification settings
      if (school.settings?.notifications) {
        setNotificationSettings({
          emailNotifications: school.settings.notifications.emailNotifications ?? true,
          smsNotifications: school.settings.notifications.smsNotifications ?? false,
          pushNotifications: school.settings.notifications.pushNotifications ?? true,
          parentNotifications: school.settings.notifications.parentNotifications ?? true,
          staffNotifications: school.settings.notifications.staffNotifications ?? true,
          dailyReport: school.settings.notifications.dailyReport ?? false,
          weeklyReport: school.settings.notifications.weeklyReport ?? true,
          attendanceAlerts: school.settings.notifications.attendanceAlerts ?? true,
          gradeAlerts: school.settings.notifications.gradeAlerts ?? true
        });
      }

      // Set feature toggles
      if (school.settings?.features) {
        setFeatureToggles({
          attendance: school.settings.features.attendance ?? true,
          gradebook: school.settings.features.gradebook ?? true,
          library: school.settings.features.library ?? false,
          transportation: school.settings.features.transportation ?? false,
          hostel: school.settings.features.hostel ?? false,
          canteen: school.settings.features.canteen ?? false,
          payroll: school.settings.features.payroll ?? false,
          inventory: school.settings.features.inventory ?? false,
          messaging: school.settings.features.messaging ?? true,
          events: school.settings.features.events ?? true
        });
      }

      toast({
        title: 'Settings Loaded',
        description: 'School settings loaded successfully',
      });
    } catch (error: any) {
      console.error('Error fetching school settings:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load school settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const { subdomain, ...dataToUpdate } = generalInfo;
      await updateGeneralInfo(dataToUpdate);
      toast({
        title: 'Success',
        description: 'General information updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving general info:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update general information',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademic = async () => {
    setSaving(true);
    try {
      await updateAcademicSettingsService(academicSettings);
      toast({
        title: 'Success',
        description: 'Academic settings updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving academic settings:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update academic settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await updateSystemPreferencesService(systemPreferences);
      toast({
        title: 'Success',
        description: 'System preferences updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await updateNotificationSettingsService(notificationSettings);
      toast({
        title: 'Success',
        description: 'Notification settings updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving notifications:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update notifications',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeatures = async () => {
    setSaving(true);
    try {
      await updateFeatureTogglesService(featureToggles);
      toast({
        title: 'Success',
        description: 'Feature settings updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving features:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update features',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!isValidImageFile(file)) {
      toast({
        title: 'Error',
        description: 'Please select a valid image file (JPEG, PNG, WebP)',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidImageSize(file, 5)) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload logo
    setUploadingLogo(true);
    try {
      const result = await uploadSchoolLogo(file);
      setGeneralInfo({ ...generalInfo, logo: result.logo });
      setLogoPreview(result.logo); // Update preview with AWS URL
      toast({
        title: 'Success',
        description: 'School logo uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload logo',
        variant: 'destructive',
      });
      // Revert preview on error
      setLogoPreview(generalInfo.logo || null);
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-siohioma-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-siohioma-primary/10 rounded-lg">
                <SettingsIcon className="h-8 w-8 text-siohioma-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">School Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Configure your school information and system preferences
                </p>
              </div>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="academic" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Academic</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Features</span>
              </TabsTrigger>
            </TabsList>

            {/* General Information Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                  <CardDescription>Basic details about your school</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="space-y-2">
                    <Label>School Logo</Label>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="School logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        {uploadingLogo && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        <Button
                          intent="action"
                          onClick={handleLogoClick}
                          disabled={uploadingLogo}
                          className="w-full sm:w-auto"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        </Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Recommended: Square image, max 5MB (PNG, JPG, WEBP)
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">School Name *</Label>
                      <Input
                        id="name"
                        value={generalInfo.name}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, name: e.target.value })}
                        placeholder="Enter school name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subdomain">Subdomain *</Label>
                      <Input
                        id="subdomain"
                        value={generalInfo.subdomain}
                        placeholder="yourschool"
                        disabled
                        className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Subdomain cannot be changed after school creation
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={generalInfo.description}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, description: e.target.value })}
                      placeholder="Brief description of your school"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="established">Established Date</Label>
                      <Input
                        id="established"
                        type="date"
                        value={generalInfo.established}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, established: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">School Type</Label>
                      <Select
                        value={generalInfo.type}
                        onValueChange={(value) => setGeneralInfo({ ...generalInfo, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIMARY">Primary School</SelectItem>
                          <SelectItem value="SECONDARY">Secondary School</SelectItem>
                          <SelectItem value="HIGH">High School</SelectItem>
                          <SelectItem value="COLLEGE">College</SelectItem>
                          <SelectItem value="UNIVERSITY">University</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>How to reach your school</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={generalInfo.email}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, email: e.target.value })}
                        placeholder="school@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={generalInfo.phone}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={generalInfo.website}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, website: e.target.value })}
                        placeholder="https://www.school.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address
                  </CardTitle>
                  <CardDescription>Physical location of your school</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Street Address</Label>
                    <Input
                      id="streetAddress"
                      value={generalInfo.streetAddress}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, streetAddress: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={generalInfo.city}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={generalInfo.state}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, state: e.target.value })}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={generalInfo.zipCode}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, zipCode: e.target.value })}
                        placeholder="12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={generalInfo.country}
                        onChange={(e) => setGeneralInfo({ ...generalInfo, country: e.target.value })}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
                <Button
                  intent="primary"
                  onClick={handleSaveGeneral}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Academic Settings Tab */}
            <TabsContent value="academic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grading System</CardTitle>
                  <CardDescription>Configure how grades are calculated and displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="gradingSystem">Grading System</Label>
                      <Select
                        value={academicSettings.gradingSystem}
                        onValueChange={(value) => setAcademicSettings({ ...academicSettings, gradingSystem: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (0-100)</SelectItem>
                          <SelectItem value="gpa">GPA (0.0-4.0)</SelectItem>
                          <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                          <SelectItem value="points">Points Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passingGrade">Passing Grade</Label>
                      <Input
                        id="passingGrade"
                        type="number"
                        value={academicSettings.passingGrade}
                        onChange={(e) => setAcademicSettings({ ...academicSettings, passingGrade: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxGrade">Maximum Grade</Label>
                      <Input
                        id="maxGrade"
                        type="number"
                        value={academicSettings.maxGrade}
                        onChange={(e) => setAcademicSettings({ ...academicSettings, maxGrade: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Academic Calendar</CardTitle>
                  <CardDescription>Term and semester configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="termSystem">Term System</Label>
                      <Select
                        value={academicSettings.termSystem}
                        onValueChange={(value) => setAcademicSettings({ ...academicSettings, termSystem: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semester">Semester (2 terms)</SelectItem>
                          <SelectItem value="trimester">Trimester (3 terms)</SelectItem>
                          <SelectItem value="quarter">Quarter (4 terms)</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfTerms">Number of Terms</Label>
                      <Input
                        id="numberOfTerms"
                        type="number"
                        min="1"
                        max="4"
                        value={academicSettings.numberOfTerms}
                        onChange={(e) => setAcademicSettings({ ...academicSettings, numberOfTerms: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Settings</CardTitle>
                  <CardDescription>Configure attendance tracking rules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Attendance Tracking</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track student and staff attendance
                      </p>
                    </div>
                    <Switch
                      checked={academicSettings.attendanceTracking}
                      onCheckedChange={(checked) => setAcademicSettings({ ...academicSettings, attendanceTracking: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="lateThreshold">Late Threshold (minutes)</Label>
                      <Input
                        id="lateThreshold"
                        type="number"
                        value={academicSettings.lateThreshold}
                        onChange={(e) => setAcademicSettings({ ...academicSettings, lateThreshold: e.target.value })}
                        placeholder="15"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="absentAfter">Mark Absent After (minutes)</Label>
                      <Input
                        id="absentAfter"
                        type="number"
                        value={academicSettings.absentAfter}
                        onChange={(e) => setAcademicSettings({ ...academicSettings, absentAfter: e.target.value })}
                        placeholder="30"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
                <Button
                  intent="primary"
                  onClick={handleSaveAcademic}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* System Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={systemPreferences.theme}
                        onValueChange={(value) => setSystemPreferences({ ...systemPreferences, theme: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={systemPreferences.primaryColor}
                        onChange={(e) => setSystemPreferences({ ...systemPreferences, primaryColor: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Settings</CardTitle>
                  <CardDescription>Language, timezone, and format preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={systemPreferences.language}
                        onValueChange={(value) => setSystemPreferences({ ...systemPreferences, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={systemPreferences.timezone}
                        onValueChange={(value) => setSystemPreferences({ ...systemPreferences, timezone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (US)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Africa/Lagos">Lagos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={systemPreferences.dateFormat}
                        onValueChange={(value) => setSystemPreferences({ ...systemPreferences, dateFormat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <Select
                        value={systemPreferences.timeFormat}
                        onValueChange={(value) => setSystemPreferences({ ...systemPreferences, timeFormat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12-hour</SelectItem>
                          <SelectItem value="24">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={systemPreferences.currency}
                        onValueChange={(value) => setSystemPreferences({ ...systemPreferences, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
                <Button
                  intent="primary"
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Channels</CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotifications: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recipient Settings</CardTitle>
                  <CardDescription>Configure who receives notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Parent Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Send notifications to parents/guardians</p>
                    </div>
                    <Switch
                      checked={notificationSettings.parentNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, parentNotifications: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Staff Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Send notifications to staff members</p>
                    </div>
                    <Switch
                      checked={notificationSettings.staffNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, staffNotifications: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automated Reports</CardTitle>
                  <CardDescription>Schedule automated reports and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Report</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive daily summary report</p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailyReport}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, dailyReport: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Report</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly summary report</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReport}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReport: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Attendance Alerts</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get alerts for attendance issues</p>
                    </div>
                    <Switch
                      checked={notificationSettings.attendanceAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, attendanceAlerts: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Grade Alerts</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get alerts for low grades</p>
                    </div>
                    <Switch
                      checked={notificationSettings.gradeAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, gradeAlerts: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
                <Button
                  intent="primary"
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Module Management</CardTitle>
                  <CardDescription>Enable or disable system modules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Attendance Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Track student attendance</p>
                      </div>
                      <Switch
                        checked={featureToggles.attendance}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, attendance: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Gradebook Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage grades and assessments</p>
                      </div>
                      <Switch
                        checked={featureToggles.gradebook}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, gradebook: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Library Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage library resources</p>
                      </div>
                      <Switch
                        checked={featureToggles.library}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, library: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Transportation Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage school transport</p>
                      </div>
                      <Switch
                        checked={featureToggles.transportation}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, transportation: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Hostel Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage hostel facilities</p>
                      </div>
                      <Switch
                        checked={featureToggles.hostel}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, hostel: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Canteen Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage canteen services</p>
                      </div>
                      <Switch
                        checked={featureToggles.canteen}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, canteen: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Payroll Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage staff payroll</p>
                      </div>
                      <Switch
                        checked={featureToggles.payroll}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, payroll: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Inventory Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Track school inventory</p>
                      </div>
                      <Switch
                        checked={featureToggles.inventory}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, inventory: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Messaging Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Internal messaging system</p>
                      </div>
                      <Switch
                        checked={featureToggles.messaging}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, messaging: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Events Module</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage school events</p>
                      </div>
                      <Switch
                        checked={featureToggles.events}
                        onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, events: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
                <Button
                  intent="primary"
                  onClick={handleSaveFeatures}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SchoolSettings;
