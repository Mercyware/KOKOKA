import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { getBooks, deleteBook, Book } from '../../services/libraryService';
import { useToast } from '@/hooks/use-toast';

const BooksList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getBooks({
        page,
        limit: 10,
        search: searchQuery || undefined,
        category: categoryFilter && categoryFilter !== 'ALL' ? categoryFilter : undefined,
        sort: 'title',
        order: 'asc',
      });

      if (response.success && response.data) {
        setBooks(response.data);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total || 0);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch books',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, searchQuery, categoryFilter]);

  const handleDelete = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await deleteBook(bookId);
      toast({
        title: 'Success',
        description: 'Book deleted successfully',
      });
      fetchBooks();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete book',
        variant: 'destructive',
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      LITERATURE: 'bg-purple-100 text-purple-800',
      SCIENCE: 'bg-blue-100 text-blue-800',
      MATHEMATICS: 'bg-green-100 text-green-800',
      HISTORY: 'bg-yellow-100 text-yellow-800',
      GEOGRAPHY: 'bg-orange-100 text-orange-800',
      REFERENCE: 'bg-red-100 text-red-800',
      FICTION: 'bg-pink-100 text-pink-800',
      MAGAZINE: 'bg-gray-100 text-gray-800',
      GENERAL: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Library Books
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your school library collection
                </p>
              </div>
              <Button intent="primary" onClick={() => navigate('/library/add-book')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Copies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {books.reduce((sum, book) => sum + book.totalCopies, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {books.reduce((sum, book) => sum + book.availableCopies, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Issued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {books.reduce((sum, book) => sum + book.issuedCopies, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="LITERATURE">Literature</SelectItem>
                    <SelectItem value="SCIENCE">Science</SelectItem>
                    <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
                    <SelectItem value="HISTORY">History</SelectItem>
                    <SelectItem value="GEOGRAPHY">Geography</SelectItem>
                    <SelectItem value="REFERENCE">Reference</SelectItem>
                    <SelectItem value="FICTION">Fiction</SelectItem>
                    <SelectItem value="MAGAZINE">Magazine</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Books Table */}
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">Loading books...</div>
              ) : books.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No books found. Add your first book to get started.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Available</TableHead>
                        <TableHead className="text-center">Issued</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">
                            {book.title}
                            {book.fileFormat && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({book.fileFormat})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                book.bookType === 'EBOOK'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : book.bookType === 'BOTH'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-slate-100 text-slate-800'
                              }
                            >
                              {book.bookType === 'EBOOK'
                                ? '📱 E-book'
                                : book.bookType === 'BOTH'
                                ? '📚 Hybrid'
                                : '📖 Physical'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(book.category)}>
                              {book.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {book.bookType === 'EBOOK' ? '∞' : book.totalCopies}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-green-600 font-semibold">
                              {book.bookType === 'EBOOK' ? '∞' : book.availableCopies}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-blue-600 font-semibold">
                              {book.issuedCopies}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                intent="action"
                                size="sm"
                                onClick={() => navigate(`/library/books/${book.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                intent="action"
                                size="sm"
                                onClick={() => navigate(`/library/books/${book.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                intent="danger"
                                size="sm"
                                onClick={() => handleDelete(book.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          intent="cancel"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          intent="primary"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BooksList;
