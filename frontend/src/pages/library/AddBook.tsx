import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { createBook } from '../../services/libraryService';
import { useToast } from '@/hooks/use-toast';

const AddBook: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    bookType: 'PHYSICAL',
    category: 'GENERAL',
    totalCopies: 1,
    availableCopies: 1,
    publisher: '',
    publicationYear: '',
    language: 'English',
    pages: '',
    description: '',
    location: '',
    price: '',
    condition: 'NEW',
    // E-book fields
    fileUrl: '',
    fileFormat: '',
    fileSize: '',
    downloadLimit: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      toast({
        title: 'Validation Error',
        description: 'Title and Author are required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const bookData: any = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || undefined,
        bookType: formData.bookType,
        category: formData.category,
        publisher: formData.publisher || undefined,
        publicationYear: formData.publicationYear
          ? Number(formData.publicationYear)
          : undefined,
        language: formData.language || undefined,
        pages: formData.pages ? Number(formData.pages) : undefined,
        description: formData.description || undefined,
        price: formData.price ? Number(formData.price) : undefined,
      };

      // Add physical book fields
      if (formData.bookType === 'PHYSICAL' || formData.bookType === 'BOTH') {
        bookData.totalCopies = Number(formData.totalCopies);
        bookData.availableCopies = Number(formData.availableCopies);
        bookData.location = formData.location || undefined;
        bookData.condition = formData.condition || undefined;
      }

      // Add e-book fields
      if (formData.bookType === 'EBOOK' || formData.bookType === 'BOTH') {
        bookData.fileUrl = formData.fileUrl || undefined;
        bookData.fileFormat = formData.fileFormat || undefined;
        bookData.fileSize = formData.fileSize ? Number(formData.fileSize) : undefined;
        bookData.downloadLimit = formData.downloadLimit ? Number(formData.downloadLimit) : undefined;
        // For e-books, set copies to 1 since it's digital
        if (formData.bookType === 'EBOOK') {
          bookData.totalCopies = 1;
          bookData.availableCopies = 1;
        }
      }

      await createBook(bookData);
      toast({
        title: 'Success',
        description: 'Book added successfully',
      });
      navigate('/library/books');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add book',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Add New Book
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add a new book to the library collection
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Book Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">
                      Author <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookType">Book Type</Label>
                    <Select
                      value={formData.bookType}
                      onValueChange={(value) => handleSelectChange('bookType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PHYSICAL">Physical Book</SelectItem>
                        <SelectItem value="EBOOK">E-book</SelectItem>
                        <SelectItem value="BOTH">Both (Hybrid)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="LITERATURE">Literature</SelectItem>
                        <SelectItem value="SCIENCE">Science</SelectItem>
                        <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
                        <SelectItem value="HISTORY">History</SelectItem>
                        <SelectItem value="GEOGRAPHY">Geography</SelectItem>
                        <SelectItem value="REFERENCE">Reference</SelectItem>
                        <SelectItem value="FICTION">Fiction</SelectItem>
                        <SelectItem value="MAGAZINE">Magazine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* E-book Fields */}
                {(formData.bookType === 'EBOOK' || formData.bookType === 'BOTH') && (
                  <>
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-4">E-book Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fileUrl">File URL</Label>
                          <Input
                            id="fileUrl"
                            name="fileUrl"
                            value={formData.fileUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/book.pdf"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fileFormat">File Format</Label>
                          <Select
                            value={formData.fileFormat}
                            onValueChange={(value) => handleSelectChange('fileFormat', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PDF">PDF</SelectItem>
                              <SelectItem value="EPUB">EPUB</SelectItem>
                              <SelectItem value="MOBI">MOBI</SelectItem>
                              <SelectItem value="AZW">AZW</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="fileSize">File Size (bytes)</Label>
                          <Input
                            id="fileSize"
                            name="fileSize"
                            type="number"
                            min="0"
                            value={formData.fileSize}
                            onChange={handleChange}
                            placeholder="e.g., 15728640 for 15MB"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="downloadLimit">Download Limit (per issue)</Label>
                          <Input
                            id="downloadLimit"
                            name="downloadLimit"
                            type="number"
                            min="0"
                            value={formData.downloadLimit}
                            onChange={handleChange}
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Inventory - Physical Books Only */}
                {(formData.bookType === 'PHYSICAL' || formData.bookType === 'BOTH') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalCopies">Total Copies</Label>
                      <Input
                        id="totalCopies"
                        name="totalCopies"
                        type="number"
                        min="1"
                        value={formData.totalCopies}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availableCopies">Available Copies</Label>
                      <Input
                        id="availableCopies"
                        name="availableCopies"
                        type="number"
                        min="0"
                        value={formData.availableCopies}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {/* Publishing Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publicationYear">Publication Year</Label>
                    <Input
                      id="publicationYear"
                      name="publicationYear"
                      type="number"
                      min="1000"
                      max={new Date().getFullYear()}
                      value={formData.publicationYear}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pages">Pages</Label>
                    <Input
                      id="pages"
                      name="pages"
                      type="number"
                      min="1"
                      value={formData.pages}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Physical Book Specific Fields */}
                {(formData.bookType === 'PHYSICAL' || formData.bookType === 'BOTH') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Shelf Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., A1-B3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => handleSelectChange('condition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="GOOD">Good</SelectItem>
                          <SelectItem value="FAIR">Fair</SelectItem>
                          <SelectItem value="POOR">Poor</SelectItem>
                          <SelectItem value="DAMAGED">Damaged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {/* E-book Price */}
                {formData.bookType === 'EBOOK' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {/* Description - Common */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                  <Button
                    intent="cancel"
                    type="button"
                    onClick={() => navigate('/library/books')}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    intent="primary"
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? 'Adding...' : 'Add Book'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddBook;
