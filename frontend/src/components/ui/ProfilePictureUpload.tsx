import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getDevSubdomain } from '@/utils/devSubdomain';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Camera, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfilePictureUploadProps {
  studentId: string;
  currentImageUrl?: string | null;
  studentName: string;
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  onDeleteSuccess?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly?: boolean;
  showDeleteButton?: boolean;
}

interface UploadState {
  isUploading: boolean;
  isDeleting: boolean;
  progress: number;
  previewUrl: string | null;
  selectedFile: File | null;
}

export function ProfilePictureUpload({
  studentId,
  currentImageUrl,
  studentName,
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess,
  className,
  size = 'md',
  readonly = false,
  showDeleteButton = true,
}: ProfilePictureUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    isDeleting: false,
    progress: 0,
    previewUrl: null,
    selectedFile: null,
  });

  // Size configurations
  const sizeConfig = {
    sm: { avatar: 'h-16 w-16', container: 'p-3' },
    md: { avatar: 'h-20 w-20', container: 'p-4' },
    lg: { avatar: 'h-24 w-24', container: 'p-5' },
    xl: { avatar: 'h-32 w-32', container: 'p-6' },
  };

  const currentSize = sizeConfig[size];

  // Validate file before processing
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'Invalid File',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setUploadState(prev => ({
      ...prev,
      selectedFile: file,
      previewUrl,
    }));
  }, [toast]);

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (readonly) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect, readonly]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Upload file to server
  const handleUpload = async () => {
    if (!uploadState.selectedFile) return;

    setUploadState(prev => ({ ...prev, isUploading: true, progress: 0 }));

    try {
      const formData = new FormData();
      formData.append('profilePicture', uploadState.selectedFile);

      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add school subdomain header if available
      const subdomain = getDevSubdomain() || 
        (window.location.hostname.includes('.') && !window.location.hostname.includes('localhost') 
          ? window.location.hostname.split('.')[0] 
          : null);
      
      if (subdomain) {
        headers['X-School-Subdomain'] = subdomain;
      }

      const response = await fetch(`/api/students/${studentId}/profile-picture`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        // Clean up preview URL
        if (uploadState.previewUrl) {
          URL.revokeObjectURL(uploadState.previewUrl);
        }

        setUploadState({
          isUploading: false,
          isDeleting: false,
          progress: 100,
          previewUrl: null,
          selectedFile: null,
        });

        toast({
          title: 'Success!',
          description: 'Profile picture uploaded successfully',
        });

        // Use the file URL from the new FileManager system
        onUploadSuccess?.(result.data.file.url || result.data.student.profilePictureUrl);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      setUploadState(prev => ({ ...prev, isUploading: false, progress: 0 }));
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      onUploadError?.(errorMessage);
    }
  };

  // Delete profile picture
  const handleDelete = async () => {
    setUploadState(prev => ({ ...prev, isDeleting: true }));

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add school subdomain header if available
      const subdomain = getDevSubdomain() || 
        (window.location.hostname.includes('.') && !window.location.hostname.includes('localhost') 
          ? window.location.hostname.split('.')[0] 
          : null);
      
      if (subdomain) {
        headers['X-School-Subdomain'] = subdomain;
      }

      const response = await fetch(`/api/students/${studentId}/profile-picture`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      const result = await response.json();

      if (result.success) {
        setUploadState(prev => ({ ...prev, isDeleting: false }));

        toast({
          title: 'Success!',
          description: 'Profile picture deleted successfully',
        });

        onDeleteSuccess?.();
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      setUploadState(prev => ({ ...prev, isDeleting: false }));
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete profile picture';
      
      toast({
        title: 'Delete Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Cancel selection
  const handleCancel = () => {
    if (uploadState.previewUrl) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }
    setUploadState({
      isUploading: false,
      isDeleting: false,
      progress: 0,
      previewUrl: null,
      selectedFile: null,
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (!readonly) {
      fileInputRef.current?.click();
    }
  };

  // Get initials for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayImageUrl = uploadState.previewUrl || currentImageUrl;
  const hasImage = Boolean(displayImageUrl);
  const canDelete = hasImage && showDeleteButton && !readonly;

  return (
    <Card className={cn('relative', className)}>
      <CardContent className={currentSize.container}>
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar with upload overlay */}
          <div
            className="relative group cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={!readonly ? triggerFileInput : undefined}
          >
            <Avatar className={cn(currentSize.avatar, 'border-2 border-dashed border-gray-300 transition-colors group-hover:border-primary')}>
              <AvatarImage 
                src={displayImageUrl || ''} 
                alt={studentName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-100 text-gray-600">
                {hasImage ? <Camera className="h-6 w-6" /> : getInitials(studentName)}
              </AvatarFallback>
            </Avatar>

            {/* Upload overlay */}
            {!readonly && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}

            {/* Loading overlay */}
            {(uploadState.isUploading || uploadState.isDeleting) && (
              <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                <div className="text-white text-xs">
                  {uploadState.isUploading ? `${Math.round(uploadState.progress)}%` : 'Deleting...'}
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {uploadState.isUploading && (
            <Progress value={uploadState.progress} className="w-full" />
          )}

          {/* File info and status */}
          {uploadState.selectedFile && (
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                {uploadState.selectedFile.name}
              </Badge>
              <p className="text-xs text-gray-500">
                {(uploadState.selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Action buttons */}
          {!readonly && (
            <div className="flex space-x-2">
              {uploadState.selectedFile ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploadState.isUploading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={uploadState.isUploading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={triggerFileInput}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Choose Image
                  </Button>
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={uploadState.isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Help text */}
          {!readonly && (
            <p className="text-xs text-gray-500 text-center">
              {uploadState.selectedFile 
                ? 'Click Upload to save the new profile picture'
                : 'Drag & drop an image or click Choose Image'
              }
              <br />
              Supports JPEG, PNG, WebP (max 5MB)
            </p>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={readonly}
        />
      </CardContent>
    </Card>
  );
}