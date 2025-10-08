import { ApiResponse, PaginatedResponse } from '../types';
import api, { get, getPaginated, post, put, del } from './api';

// Library types
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  bookType: 'PHYSICAL' | 'EBOOK' | 'BOTH';
  category: string;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  publisher?: string;
  publicationYear?: number;
  language?: string;
  pages?: number;
  description?: string;
  location?: string;
  price?: number;
  condition?: string;
  coverImageUrl?: string;
  // E-book fields
  fileUrl?: string;
  fileFormat?: string;
  fileSize?: number;
  downloadLimit?: number;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  fine: number;
  remarks?: string;
  issuedById: string;
  returnedById?: string;
  condition?: string;
  book?: Book;
  student?: any;
  issuedBy?: any;
  returnedBy?: any;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  activeIssues: number;
  overdueIssues: number;
  totalFines: number;
}

export interface BookFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  category?: string;
  search?: string;
}

export interface IssueFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  studentId?: string;
  bookId?: string;
  overdue?: boolean;
}

// Get all books with pagination and filtering
export const getBooks = async (filters: BookFilters = {}): Promise<PaginatedResponse<Book>> => {
  try {
    const response = await api.get('/library/books', { params: filters });

    if (response.data && response.data.books) {
      return {
        success: true,
        data: response.data.books,
        total: response.data.pagination.total,
        count: response.data.pagination.limit,
        totalPages: response.data.pagination.pages,
        page: response.data.pagination.page
      };
    }

    return await getPaginated<Book>('/library/books', filters);
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Get book by ID
export const getBookById = async (id: string): Promise<{ success: boolean; book: Book }> => {
  try {
    const response = await get<{ book: Book }>(`/library/books/${id}`);
    if (response && 'book' in response) {
      return { success: true, book: response.book };
    }
    if (response && 'data' in response) {
      return { success: true, book: response.data };
    }
    throw new Error('Invalid response shape');
  } catch (error) {
    return { success: false, book: {} as Book };
  }
};

// Create new book
export const createBook = async (bookData: Partial<Book>): Promise<ApiResponse<Book>> => {
  try {
    return await post<Book>('/library/books', bookData);
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

// Update book
export const updateBook = async (id: string, bookData: Partial<Book>): Promise<ApiResponse<Book>> => {
  try {
    return await put<Book>(`/library/books/${id}`, bookData);
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

// Delete book
export const deleteBook = async (id: string): Promise<ApiResponse<any>> => {
  try {
    return await del<any>(`/library/books/${id}`);
  } catch (error) {
    console.error(`Error deleting book with ID ${id}:`, error);
    throw error;
  }
};

// Get all book issues
export const getBookIssues = async (filters: IssueFilters = {}): Promise<PaginatedResponse<BookIssue>> => {
  try {
    const response = await api.get('/library/issues', { params: filters });

    if (response.data && response.data.issues) {
      return {
        success: true,
        data: response.data.issues,
        total: response.data.pagination.total,
        count: response.data.pagination.limit,
        totalPages: response.data.pagination.pages,
        page: response.data.pagination.page
      };
    }

    return await getPaginated<BookIssue>('/library/issues', filters);
  } catch (error) {
    console.error('Error fetching book issues:', error);
    throw error;
  }
};

// Issue book to student
export const issueBook = async (issueData: { bookId: string; studentId: string; dueDate: string; remarks?: string }): Promise<ApiResponse<BookIssue>> => {
  try {
    return await post<BookIssue>('/library/issues', issueData);
  } catch (error) {
    console.error('Error issuing book:', error);
    throw error;
  }
};

// Return book
export const returnBook = async (issueId: string, returnData: { condition?: string; remarks?: string }): Promise<ApiResponse<BookIssue>> => {
  try {
    return await put<BookIssue>(`/library/issues/${issueId}/return`, returnData);
  } catch (error) {
    console.error('Error returning book:', error);
    throw error;
  }
};

// Get library statistics
export const getLibraryStats = async (): Promise<ApiResponse<LibraryStats>> => {
  try {
    return await get<LibraryStats>('/library/stats');
  } catch (error) {
    console.error('Error fetching library stats:', error);
    throw error;
  }
};
