const { prisma } = require('../utils/prismaHelpers');

// Get all books with pagination and filtering
exports.getAllBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'title',
      order = 'asc',
      status,
      category,
      search,
    } = req.query;

    // Build where clause
    const where = {
      schoolId: req.school.id,
    };

    if (status) where.status = status;
    if (category) where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: { [sort]: order === 'desc' ? 'desc' : 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      success: true,
      books,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: {
        bookIssues: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
              },
            },
            issuedBy: {
              select: {
                name: true,
                email: true,
              },
            },
            returnedBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, book });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create new book
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      publisher,
      publishedDate,
      edition,
      language,
      category,
      subcategory,
      description,
      pages,
      coverImageUrl,
      totalCopies,
      location,
      rackNumber,
      price,
      procuredDate,
      vendor,
      tags,
      subjects,
    } = req.body;

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        publisher,
        publishedDate: publishedDate ? new Date(publishedDate) : null,
        edition,
        language: language || 'English',
        category: category || 'GENERAL',
        subcategory,
        description,
        pages: pages ? parseInt(pages) : null,
        coverImageUrl,
        totalCopies: totalCopies ? parseInt(totalCopies) : 1,
        availableCopies: totalCopies ? parseInt(totalCopies) : 1,
        issuedCopies: 0,
        location,
        rackNumber,
        price: price ? parseFloat(price) : null,
        procuredDate: procuredDate ? new Date(procuredDate) : null,
        vendor,
        tags: tags || [],
        subjects: subjects || [],
        status: 'AVAILABLE',
        schoolId: req.school.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book,
    });
  } catch (error) {
    console.error('Error creating book:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists',
        error: 'Duplicate ISBN',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!existingBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const updateData = {};

    // Map fields
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.author !== undefined) updateData.author = req.body.author;
    if (req.body.isbn !== undefined) updateData.isbn = req.body.isbn;
    if (req.body.publisher !== undefined) updateData.publisher = req.body.publisher;
    if (req.body.publishedDate !== undefined) updateData.publishedDate = req.body.publishedDate ? new Date(req.body.publishedDate) : null;
    if (req.body.edition !== undefined) updateData.edition = req.body.edition;
    if (req.body.language !== undefined) updateData.language = req.body.language;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.subcategory !== undefined) updateData.subcategory = req.body.subcategory;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.pages !== undefined) updateData.pages = req.body.pages ? parseInt(req.body.pages) : null;
    if (req.body.coverImageUrl !== undefined) updateData.coverImageUrl = req.body.coverImageUrl;
    if (req.body.totalCopies !== undefined) {
      const newTotal = parseInt(req.body.totalCopies);
      const diff = newTotal - existingBook.totalCopies;
      updateData.totalCopies = newTotal;
      updateData.availableCopies = existingBook.availableCopies + diff;
    }
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.rackNumber !== undefined) updateData.rackNumber = req.body.rackNumber;
    if (req.body.price !== undefined) updateData.price = req.body.price ? parseFloat(req.body.price) : null;
    if (req.body.procuredDate !== undefined) updateData.procuredDate = req.body.procuredDate ? new Date(req.body.procuredDate) : null;
    if (req.body.vendor !== undefined) updateData.vendor = req.body.vendor;
    if (req.body.tags !== undefined) updateData.tags = req.body.tags || [];
    if (req.body.subjects !== undefined) updateData.subjects = req.body.subjects || [];
    if (req.body.status !== undefined) updateData.status = req.body.status;

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
    });

    res.json({ success: true, book: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists',
        error: 'Duplicate ISBN',
      });
    }

    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        bookIssues: {
          where: { status: 'ISSUED' },
        },
      },
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.bookIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active issues. Please return all copies first.',
      });
    }

    // Delete all book issues (history)
    await prisma.bookIssue.deleteMany({
      where: { bookId: bookId },
    });

    // Delete book
    await prisma.book.delete({
      where: { id: bookId },
    });

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all book issues with pagination and filtering
exports.getAllBookIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      studentId,
      bookId,
      overdue,
    } = req.query;

    const where = {
      schoolId: req.school.id,
    };

    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    if (bookId) where.bookId = bookId;

    // Filter overdue books
    if (overdue === 'true') {
      where.status = 'ISSUED';
      where.dueDate = { lt: new Date() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookIssues, total] = await Promise.all([
      prisma.bookIssue.findMany({
        where,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              isbn: true,
            },
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNumber: true,
            },
          },
          issuedBy: {
            select: {
              name: true,
              email: true,
            },
          },
          returnedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { issueDate: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.bookIssue.count({ where }),
    ]);

    res.json({
      success: true,
      issues: bookIssues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching book issues:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Issue a book to a student
exports.issueBook = async (req, res) => {
  try {
    const { bookId, studentId, dueDate, issueNotes } = req.body;

    // Check if book exists and has available copies
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'No available copies of this book' });
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if student already has this book issued
    const existingIssue = await prisma.bookIssue.findFirst({
      where: {
        bookId,
        studentId,
        status: 'ISSUED',
      },
    });

    if (existingIssue) {
      return res.status(400).json({
        success: false,
        message: 'Student already has this book issued',
      });
    }

    // Create book issue
    const bookIssue = await prisma.bookIssue.create({
      data: {
        bookId,
        studentId,
        schoolId: req.school.id,
        issueDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'ISSUED',
        issuedById: req.user.id,
        issueNotes,
      },
      include: {
        book: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
      },
    });

    // Update book available copies
    await prisma.book.update({
      where: { id: bookId },
      data: {
        availableCopies: book.availableCopies - 1,
        issuedCopies: book.issuedCopies + 1,
        status: book.availableCopies - 1 > 0 ? 'AVAILABLE' : 'ISSUED',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: bookIssue,
    });
  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, returnNotes, fine, fineReason } = req.body;

    const bookIssue = await prisma.bookIssue.findUnique({
      where: { id },
      include: {
        book: true,
      },
    });

    if (!bookIssue) {
      return res.status(404).json({ success: false, message: 'Book issue not found' });
    }

    if (bookIssue.status !== 'ISSUED') {
      return res.status(400).json({ success: false, message: 'Book is not currently issued' });
    }

    // Update book issue
    const updatedIssue = await prisma.bookIssue.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnDate: new Date(),
        returnedById: req.user.id,
        condition: condition || 'GOOD',
        returnNotes,
        fine: fine ? parseFloat(fine) : 0,
        fineReason,
        finePaid: false,
      },
      include: {
        book: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
      },
    });

    // Update book available copies
    const book = bookIssue.book;
    await prisma.book.update({
      where: { id: book.id },
      data: {
        availableCopies: book.availableCopies + 1,
        issuedCopies: book.issuedCopies - 1,
        status: 'AVAILABLE',
      },
    });

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: updatedIssue,
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get library statistics
exports.getLibraryStats = async (req, res) => {
  try {
    const [
      totalBooks,
      availableBooks,
      issuedBooks,
      overdueBooks,
      totalStudentsWithBooks,
    ] = await Promise.all([
      prisma.book.count({
        where: { schoolId: req.school.id },
      }),
      prisma.book.aggregate({
        where: { schoolId: req.school.id },
        _sum: { availableCopies: true },
      }),
      prisma.bookIssue.count({
        where: {
          schoolId: req.school.id,
          status: 'ISSUED',
        },
      }),
      prisma.bookIssue.count({
        where: {
          schoolId: req.school.id,
          status: 'ISSUED',
          dueDate: { lt: new Date() },
        },
      }),
      prisma.bookIssue.findMany({
        where: {
          schoolId: req.school.id,
          status: 'ISSUED',
        },
        distinct: ['studentId'],
        select: { studentId: true },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalBooks,
        availableCopies: availableBooks._sum.availableCopies || 0,
        issuedBooks,
        overdueBooks,
        totalStudentsWithBooks: totalStudentsWithBooks.length,
      },
    });
  } catch (error) {
    console.error('Error fetching library stats:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
