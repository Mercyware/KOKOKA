import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Download, BookOpen } from 'lucide-react';
import { getBookById, Book } from '../../services/libraryService';
import { useToast } from '@/hooks/use-toast';

const ViewBook: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  const fetchBook = async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      const response = await getBookById(bookId);
      if (response.success && response.book) {
        setBook(response.book);
      } else {
        toast({
          title: 'Error',
          description: 'Book not found',
          variant: 'destructive',
        });
        navigate('/library/books');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch book details',
        variant: 'destructive',
      });
      navigate('/library/books');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (book?.fileUrl) {
      window.open(book.fileUrl, '_blank');
      toast({
        title: 'Download Started',
        description: 'E-book download has been initiated',
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">Loading book details...</div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              intent="cancel"
              onClick={() => navigate('/library/books')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Books
            </Button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  {book.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  by {book.author}
                </p>
              </div>
              <div className="flex gap-2">
                {book.bookType === 'EBOOK' && book.fileUrl && (
                  <Button intent="primary" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button
                  intent="action"
                  onClick={() => navigate(`/library/books/${book.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Book Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <div className="mt-1">
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
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <div className="mt-1">
                        <Badge className={getCategoryColor(book.category)}>
                          {book.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">ISBN</label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {book.isbn || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Publisher</label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {book.publisher || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Language</label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {book.language || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Pages</label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {book.pages || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {book.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {book.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* E-book Details */}
              {(book.bookType === 'EBOOK' || book.bookType === 'BOTH') && (
                <Card>
                  <CardHeader>
                    <CardTitle>E-book Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          File Format
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {book.fileFormat || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">File Size</label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {formatFileSize(book.fileSize)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Download Limit
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {book.downloadLimit
                            ? `${book.downloadLimit} downloads per issue`
                            : 'Unlimited'}
                        </p>
                      </div>
                      {book.fileUrl && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            File Status
                          </label>
                          <p className="mt-1">
                            <Badge className="bg-green-100 text-green-800">Available</Badge>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Physical Book Details */}
              {(book.bookType === 'PHYSICAL' || book.bookType === 'BOTH') && (
                <Card>
                  <CardHeader>
                    <CardTitle>Physical Book Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Location</label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {book.location || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Condition</label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {book.condition || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability */}
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Copies</label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {book.bookType === 'EBOOK' ? '∞' : book.totalCopies}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Available Copies
                    </label>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {book.bookType === 'EBOOK' ? '∞' : book.availableCopies}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Issued Copies</label>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {book.issuedCopies}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              {book.price && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Price</label>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        ${book.price.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewBook;
