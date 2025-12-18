
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import documentService, { UploadDocumentData } from '@/services/documentService';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface DocumentUploadProps {
    onUploadSuccess?: () => void;
    studentId?: string; // Optional: if linking to a student
    staffId?: string; // Optional: if linking to a staff member
    // We might want to extend this to be more generic "relatedEntityId" later, but for now matching the service
    trigger?: React.ReactNode;
}

export function DocumentUpload({ onUploadSuccess, studentId, staffId, trigger }: DocumentUploadProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<Omit<UploadDocumentData, 'file' | 'studentId'>>({
        title: '',
        description: '',
        category: 'OTHER',
        tags: '',
        isPublic: false
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            // Auto-fill title if empty
            if (!formData.title) {
                setFormData(prev => ({ ...prev, title: selectedFile.name }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast({
                title: "Error",
                description: "Please select a file to upload.",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            await documentService.uploadDocument({
                file,
                studentId,
                staffId,
                ...formData
            });

            toast({
                title: "Success",
                description: "Document uploaded successfully."
            });

            setOpen(false);
            resetForm();
            if (onUploadSuccess) onUploadSuccess();
        } catch (error: any) {
            console.error("Upload error", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to upload document.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setFormData({
            title: '',
            description: '',
            category: 'OTHER',
            tags: '',
            isPublic: false
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Document
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Upload a new document. Supported files: PDF, Images, Word, Excel.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="file">File</Label>
                        <Input
                            id="file"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            required
                        />
                        {file && (
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                                <FileText className="h-4 w-4 mr-1" />
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                        )}
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Document title"
                            required
                        />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="category">Category</Label>
                        <select
                            id="category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="OTHER">Other</option>
                            <option value="ACADEMIC_MATERIALS">Academic Materials</option>
                            <option value="STAFF_DOCUMENTS">Staff Documents</option>
                            <option value="STUDENT_DOCUMENTS">Student Documents</option>
                            <option value="REPORTS">Reports</option>
                            <option value="CERTIFICATES">Certificates</option>
                            <option value="POLICIES">Policies</option>
                        </select>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional description"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !file}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
