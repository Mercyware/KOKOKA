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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ClipboardList, Search, BookOpen, RotateCcw, Plus } from 'lucide-react';
import { getBookIssues, returnBook, issueBook, BookIssue, getBooks, Book } from '../../services/libraryService';
import { getStudents } from '../../services/studentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const BookIssues: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Return book dialog
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<BookIssue | null>(null);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnRemarks, setReturnRemarks] = useState('');

  // Issue book dialog
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
    dueDate: '',
    remarks: '',
  });

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await getBookIssues({
        page,
        limit: 10,
        status: statusFilter && statusFilter !== 'ALL' ? statusFilter : undefined,
        sort: 'issueDate',
        order: 'desc',
      });

      if (response.success && response.data) {
        setIssues(response.data);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total || 0);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch book issues',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBooksAndStudents = async () => {
    try {
      const [booksRes, studentsRes] = await Promise.all([
        getBooks({ limit: 100 }),
        getStudents({ limit: 100 }),
      ]);

      if (booksRes.success && booksRes.data) {
        setBooks(booksRes.data.filter(b => b.availableCopies > 0));
      }

      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data);
      }
    } catch (error: any) {
      console.error('Error fetching books/students:', error);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [page, statusFilter]);

  useEffect(() => {
    fetchBooksAndStudents();
  }, []);

  const handleReturnBook = async () => {
    if (!selectedIssue) return;

    try {
      await returnBook(selectedIssue.id, {
        condition: returnCondition,
        remarks: returnRemarks || undefined,
      });
      toast({
        title: 'Success',
        description: 'Book returned successfully',
      });
      setReturnDialogOpen(false);
      setSelectedIssue(null);
      setReturnCondition('GOOD');
      setReturnRemarks('');
      fetchIssues();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to return book',
        variant: 'destructive',
      });
    }
  };

  const handleIssueBook = async () => {
    if (!issueForm.bookId || !issueForm.studentId || !issueForm.dueDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await issueBook({
        bookId: issueForm.bookId,
        studentId: issueForm.studentId,
        dueDate: issueForm.dueDate,
        remarks: issueForm.remarks || undefined,
      });
      toast({
        title: 'Success',
        description: 'Book issued successfully',
      });
      setIssueDialogOpen(false);
      setIssueForm({ bookId: '', studentId: '', dueDate: '', remarks: '' });
      fetchIssues();
      fetchBooksAndStudents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to issue book',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ISSUED: 'bg-blue-100 text-blue-800',
      RETURNED: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      LOST: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'RETURNED') return false;
    return new Date(dueDate) < new Date();
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
                  <ClipboardList className="h-6 w-6" />
                  Book Issues
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track and manage book borrowing
                </p>
              </div>
              <Button intent="primary" onClick={() => setIssueDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Issue Book
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {issues.filter((i) => i.status === 'ISSUED').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {issues.filter((i) => isOverdue(i.dueDate, i.status)).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Fines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ${issues.reduce((sum, issue) => sum + issue.fine, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ISSUED">Issued</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Issues Table */}
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">Loading issues...</div>
              ) : issues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No book issues found.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fine</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">
                            {issue.book?.title || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {issue.student
                              ? `${issue.student.firstName} ${issue.student.lastName}`
                              : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(issue.issueDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                isOverdue(issue.dueDate, issue.status)
                                  ? 'text-red-600 font-semibold'
                                  : ''
                              }
                            >
                              {format(new Date(issue.dueDate), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {issue.returnDate
                              ? format(new Date(issue.returnDate), 'MMM dd, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(issue.status)}>
                              {issue.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {issue.fine > 0 ? (
                              <span className="text-red-600 font-semibold">
                                ${issue.fine.toFixed(2)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {issue.status === 'ISSUED' && (
                              <Button
                                intent="action"
                                size="sm"
                                onClick={() => {
                                  setSelectedIssue(issue);
                                  setReturnDialogOpen(true);
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Return
                              </Button>
                            )}
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

      {/* Return Book Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>
              Record the return of "{selectedIssue?.book?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Book Condition</Label>
              <Select value={returnCondition} onValueChange={setReturnCondition}>
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
              <Label htmlFor="returnRemarks">Remarks</Label>
              <Input
                id="returnRemarks"
                value={returnRemarks}
                onChange={(e) => setReturnRemarks(e.target.value)}
                placeholder="Optional remarks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button intent="cancel" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button intent="primary" onClick={handleReturnBook}>
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Book Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Book</DialogTitle>
            <DialogDescription>Issue a book to a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="book">
                Book <span className="text-red-500">*</span>
              </Label>
              <Select
                value={issueForm.bookId}
                onValueChange={(value) =>
                  setIssueForm((prev) => ({ ...prev, bookId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} ({book.availableCopies} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">
                Student <span className="text-red-500">*</span>
              </Label>
              <Select
                value={issueForm.studentId}
                onValueChange={(value) =>
                  setIssueForm((prev) => ({ ...prev, studentId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={issueForm.dueDate}
                onChange={(e) =>
                  setIssueForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueRemarks">Remarks</Label>
              <Input
                id="issueRemarks"
                value={issueForm.remarks}
                onChange={(e) =>
                  setIssueForm((prev) => ({ ...prev, remarks: e.target.value }))
                }
                placeholder="Optional remarks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button intent="cancel" onClick={() => setIssueDialogOpen(false)}>
              Cancel
            </Button>
            <Button intent="primary" onClick={handleIssueBook}>
              Issue Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BookIssues;
