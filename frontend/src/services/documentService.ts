
import api from './api';

export interface Document {
    _id: string;
    title: string;
    fileName: string;
    originalName: string;
    fileUrl: string;
    fileType: string;
    fileExtension: string;
    mimeType: string;
    fileSize: number;
    uploadedBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    description?: string;
    category?: string;
    tags?: string[];
    metadata?: any;
}

export interface UploadDocumentData {
    file: File;
    title?: string;
    description?: string;
    category?: string;
    tags?: string; // Comma separated
    studentId?: string; // Optional linkage
    staffId?: string; // Optional linkage
    isPublic?: boolean;
}

export interface GetDocumentsParams {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    studentId?: string; // To filter by student if needed
    uploadedBy?: string;
}

const documentService = {
    // Upload a document
    uploadDocument: async (data: UploadDocumentData) => {
        const formData = new FormData();
        formData.append('files', data.file);

        if (data.title) formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.category) formData.append('category', data.category);
        if (data.tags) formData.append('tags', data.tags);
        if (data.studentId) formData.append('studentId', data.studentId);
        if (data.staffId) formData.append('staffId', data.staffId);
        if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));

        // Based on documentController, it expects 'files' array, and returns data array
        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get list of documents
    getDocuments: async (params: GetDocumentsParams = {}) => {
        const response = await api.get('/documents', { params });
        return response.data;
    },

    // Delete a document
    deleteDocument: async (id: string) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    },

    // Download a document (helper to construct URL or trigger download)
    getDownloadUrl: (id: string) => {
        // This assumes the API is served from the same origin or configured base URL
        // We might need to append the auth token if it's a protected download endpoint meant to be visited directly
        return `/api/documents/${id}/download`;
    }
};

export default documentService;
